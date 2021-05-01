import { Request, Response, NextFunction } from 'express';
import Post, { IPost } from '../models/Post';
import User from '../models/User';
import PostsDBService from '../services/Posts';
import EventsDBService from '../services/Events';
import FriendsDBService from '../services/Friends';
import CommentsDBService from '../services/Comments';
import { IObject } from '../types/IObject';
import compress from '../utils/compress';

// @desc     Get statistics
// @route    GET /api/posts/statistics
// @access   Public

exports.getStatistics = async (req: Request, res: Response, next: NextFunction) => {
  let posts: any = await Post.countDocuments();
  let users: any = await User.countDocuments();
  let result = {
    posts: posts,
    users: users,
  };
  return { data: result };
};

// @desc     Get all posts
// @route    GET /api/posts
// @access   Private

const getPosts = async (req: Request, res: Response, next: NextFunction) => {
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

const getUsersPosts = async (req: Request, res: Response, next: NextFunction) => {
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

// @desc     Get a single post
// @route    GET /api/posts/:id
// @access   Private

const getPost = async (req: Request, res: Response, next: NextFunction) => {
  let post = await PostsDBService.getPost(
    {
      _id: req.params.id,
    },
    {
      select: '-__v -updated_at',
      populate: { author: true, comments: true, event: true, populateEventUsers: true },
    }
  );

  return { data: post };
};

// @desc     Create new post
// @route    POST /api/posts
// @access   Private

const createPost = async (req: Request, res: Response, next: NextFunction) => {
  let { text, isEvent, group, display } = req.body;
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
        initiator: req.user._id,
        participants: [req.user._id],
      });

      await PostsDBService.updatePost(post._id, { event: eventDoc._id });
      post = await PostsDBService.getPost(
        {
          _id: post._id,
        },
        {
          select: '-__v -updated_at',
          populate: { author: true, comments: true, event: true, populateEventUsers: true },
        }
      );
      return { data: post };
    } catch (error) {
      return { errors: [{ msg: error?.message }] };
    }
  }
  return { data: post };
};

// @desc     Update post
// @route    PUT /api/posts/:id
// @access   Private

const updatePost = async (req: Request, res: Response, next: NextFunction) => {
  let updateFields: any = {};
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
        populate: { author: true, comments: true, event: true, populateEventUsers: true },
      }
    ),
  };
};

// @desc     Delete post
// @route    Delete /api/posts/:id
// @access   Private

const deletePost = async (req: Request, res: Response, next: NextFunction) => {
  let post = await PostsDBService.getPost({ _id: req.params.id });
  if (post.event) await EventsDBService.deleteEvent(post.event);
  if (post.comments.length) await CommentsDBService.deletePostsComments(post._id);
  await PostsDBService.deletePost(req.params.id);

  return { msg: 'Removed post' };
};

// @desc     Share post
// @route    POST /api/posts/:id
// @access   Private

const sharePost = async (req: Request, res: Response, next: NextFunction) => {
  await PostsDBService.sharePost(req.params.id, req.user._id);
};

// // @desc     Unshare post
// // @route    POST /api/posts/:id
// // @access   Private

const unsharePost = async (req: Request, res: Response, next: NextFunction) => {
  await PostsDBService.unsharePost(req.params.id, req.user._id);
};

// // @desc     Like post
// // @route    POST /api/posts/:id/like
// // @access   Private

const likePost = async (req: Request, res: Response, next: NextFunction) => {
  await PostsDBService.likePost(req.params.id, req.user._id);
};

// @desc     Dislike post
// @route    POST /api/posts/:id/dislike
// @access   Private

const dislikePost = async (req: Request, res: Response, next: NextFunction) => {
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
};
