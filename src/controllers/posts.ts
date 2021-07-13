import { Request, Response, NextFunction } from 'express';
import Post, { IPost } from '../models/Post';
import PostsDBService from '../services/Posts';
import EventsDBService from '../services/Events';
import FriendsDBService from '../services/Friends';
import CommentsDBService from '../services/Comments';
import UsersDBService from '../services/Users';
import { IObject } from '../types/IObject';
import compress from '../utils/compress';

const getStatistics = async (req: Request) => {
  let users = await UsersDBService.count({});
  let posts = await PostsDBService.count({});
  let result = {
    posts: posts,
    users: users,
  };
  return { data: result };
};

const getPosts = async (req: Request) => {
  const { offset, limit } = req.query;
  let friends = await FriendsDBService.getFriends(req.user._id);

  let privateFilter: IObject = {
    display: 'friends',
    author: { $in: [...friends, req.user._id] },
  };

  let publicFilter: IObject = {
    display: 'all',
  };

  let sportFilter: IObject = {};

  if (req.query.sports) {
    sportFilter['event.eventType'] = {
      $in: typeof req.query.sports === 'string' ? req.query.sports.split(',') : req.query.sports,
    };
  }

  let eventFilter: IObject = {};

  if (req.query?.isEvent) {
    eventFilter.event = { $exists: !!+req.query?.isEvent };
  }

  let posts = await PostsDBService.getPosts({
    offset: +offset,
    limit: +limit,
    filter: {
      $and: [{ $or: [privateFilter, publicFilter] }, eventFilter, sportFilter],
    },
    select: '-__v -updated_at',
    populate: { author: true, comments: true, event: true },
    sort: { created_at: -1 },
  });

  return { data: posts };
};

const getUsersPosts = async (req: Request) => {
  const friends = await FriendsDBService.getFriends(req.params.id);
  const { offset, limit } = req.query;

  let filter = {
    $or: [
      {
        display: 'all',
        author: req.params.id,
      },
      { sharedBy: req.params.id },
    ],
  };

  if (friends.includes(req.user._id.toString())) {
    filter.$or.push({
      display: 'friends',
      author: req.params.id,
    });
  }

  let posts = await PostsDBService.getPosts({
    offset: +offset,
    limit: +limit,
    filter,
    select: '-__v -updated_at',
    populate: { author: true, comments: true, event: true },
    sort: { created_at: -1 },
  });

  return { data: posts };
};

const getPost = async (req: Request) => {
  let post = await PostsDBService.getPost(
    {
      _id: req.params.id,
    },
    {
      select: '-__v -updated_at',
      populate: {
        author: true,
        comments: true,
        event: true,
        populateEventUsers: true,
      },
    }
  );

  return { data: post };
};

const createPost = async (req: Request) => {
  let { text, group, display } = req.body;
  let postData: IPost = {
    author: req.user._id,
    display,
    text,
  };

  if (req.file) {
    postData.image = await compress(req.user._id, req.file);
  }

  if (group) postData.group = group;

  let post = await PostsDBService.createPost(postData);

  if (req.body.event) {
    try {
      const { event } = req.body;
      const {
        location: { coordinates },
      } = event;

      let eventDoc = await EventsDBService.createEvent({
        ...event,
        location: { type: 'Point', coordinates },
        openEvent: +event.openEvent,
        participants: [req.user._id],
      });

      await PostsDBService.updatePost(post._id, { event: eventDoc._id });
      post = await PostsDBService.getPost(
        {
          _id: post._id,
        },
        {
          select: '-__v -updated_at',
          populate: {
            author: true,
            comments: true,
            event: true,
            populateEventUsers: true,
          },
        }
      );
      return { data: post };
    } catch (error) {
      return { errors: [{ msg: error?.message }] };
    }
  }
  return { data: post };
};

const updatePost = async (req: Request) => {
  let updateFields: IObject = {};
  if (req.body.text) updateFields.text = req.body.text;
  if (Object.keys(updateFields).length > 0) {
    await PostsDBService.updatePost(req.params.id, updateFields);
  }
  return {
    data: await PostsDBService.getPost(
      {
        _id: req.params.id,
      },
      {
        select: '-__v -updated_at',
        populate: {
          author: true,
          comments: true,
          event: true,
          populateEventUsers: true,
        },
      }
    ),
  };
};

const deletePost = async (req: Request) => {
  let post = await PostsDBService.getPost({ _id: req.params.id });
  if (post.event) await EventsDBService.deleteEvent(post.event);
  if (post.comments.length) await CommentsDBService.deletePostsComments(post._id);
  await PostsDBService.deletePost(req.params.id);

  return { msg: 'Removed post' };
};

const sharePost = async (req: Request) => {
  await PostsDBService.sharePost(req.params.id, req.user._id);
};

const unsharePost = async (req: Request) => {
  await PostsDBService.unsharePost(req.params.id, req.user._id);
};

const likePost = async (req: Request) => {
  await PostsDBService.likePost(req.params.id, req.user._id);
};

const dislikePost = async (req: Request) => {
  await PostsDBService.unlikePost(req.params.id, req.user._id);
};

export default {
  getPosts,
  getPost,
  createPost,
  deletePost,
  updatePost,
  getUsersPosts,
  sharePost,
  unsharePost,
  likePost,
  dislikePost,
  getStatistics,
};
