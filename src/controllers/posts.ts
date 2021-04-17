import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Post, { IPost } from '../models/Post';
import User from '../models/User';
import UserDBService from '../services/User';
import PostsDBService from '../services/Posts';
import EventsDBService from '../services/Events';
import FriendsDBService from '../services/Friends';
import { IObject } from '../types/IObject';
import compress from '../utils/compress';
import { IEvent } from '../models/Event';

// @desc     Get statistics
// @route    GET /api/posts/statistics
// @access   Public

exports.getStatistics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let posts: any = await Post.countDocuments();
  let users: any = await User.countDocuments();
  let result = {
    posts: posts,
    users: users,
  };
  return res.status(200).json({ result });
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
      $in: typeof req.query.sports === 'string' ? req.query.sports.split(',') : 
    };
  }

  let eventFilter: IObject = {};

  if (req.query?.isEvent !== undefined) {
    eventFilter.isEvent = !!+req.query.isEvent;
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

  return { success: true, data: posts };
};

// exports.getUsersPosts = async (req: any, res: Response, next: NextFunction) => {
//   let user = await UserDBService.getUserByID(req.params.id);
//   if (!user) return res.status(404).json({ msg: 'No user found' });

//   let friends = user.friends;

//   let privatePosts = [];

//   if (friends.includes(req.user.toString())) {
//     let privateFilter = {
//       display: 'friends',
//       user: req.params.id,
//     };

//     privatePosts = await Post.find(privateFilter)
//       .populate('user', 'name lastname avatar')
//       .populate('event.participants', 'name lastname avatar')
//       .populate('event.initiator', 'name lastname avatar')
//       .populate('event.rejectedParticipants', 'name lastname avatar')
//       .populate('event.awaitingApprovalParticipants', 'name lastname avatar')
//       .populate('comments.user', 'name lastname _id created_at')
//       .sort({ created_at: -1 })
//       .exec();
//   }

//   let publicFilter = {
//     display: 'all',
//     user: req.params.id,
//   };

//   let publicPosts = await Post.find(publicFilter)
//     .populate('user', 'name lastname avatar')
//     .populate('event.participants', 'name lastname avatar')
//     .populate('event.initiator', 'name lastname avatar')
//     .populate('event.rejectedParticipants', 'name lastname avatar')
//     .populate('event.awaitingApprovalParticipants', 'name lastname avatar')
//     .populate('comments.user', 'name lastname _id created_at')
//     .sort({ created_at: -1 })
//     .exec();

//   let sorted = [...publicPosts, ...privatePosts]
//     .filter((item: any) => {
//       if (
//         user.posts.includes(item._id.toString()) ||
//         user.sharedPosts.includes(item._id.toString())
//       ) {
//         return false;
//       }
//       return true;
//     })
//     .sort(
//       (a: any, b: any) =>
//         new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
//     );

//   const start = req.query.start;
//   const limit = 10;
//   let posts = sorted.slice(start, start + limit);
//   res.status(200).json({ success: true, posts });
// };

// @desc     Get a single post
// @route    GET /api/posts/:id
// @access   Private

// TODO: add validator to check the id of the post and check if it exists before getting to this function
// if (mongoose.Types.ObjectId.isValid(req.params.id)) {

const getPost = async (req: Request, res: Response, next: NextFunction) => {
  let post = await PostsDBService.getPost({
    _id: req.params.id,
    select: '-__v -updated_at',
    populate: { author: true, comments: true, event: true },
  });

  return { data: post };
};

// @desc     Create new post
// @route    POST /api/posts
// @access   Private

const createPost = async (req: Request, res: Response, next: NextFunction) => {
  let { text, isEvent, group, display } = req.body;
  isEvent = isEvent === 'true' ? true : false;
  let postData: IPost = {
    author: req.user._id,
    display: display === 'all' ? 'all' : 'friends',
    text,
    isEvent,
  };

  // TODO: move to validator
  // Not sufficient data to create a post
  if (!text && !req.file)
    return { errors: [{ msg: 'Please include at least some text or image.' }] };

  if (req.file) {
    postData.image = await compress(req.user._id, req.file);
  }

  if (group) postData.group = group;

  let post = await PostsDBService.createPost(postData);

  if (isEvent) {
    try {
      const { event } = req.body;
      const {
        startDate,
        eventType,
        pace,
        openEvent,
        location,
        limitParticipants,
      } = JSON.parse(event);
      // TODO: move to validator
      // If not sufficient data to create an event, return error
      if (
        !startDate ||
        !eventType ||
        !pace ||
        !location.type ||
        !location.coordinates ||
        !limitParticipants
      )
        return { errors: [{ msg: 'Please include all needed data.' }] };

      let eventDoc = await EventsDBService.createEvent({
        startDate,
        eventType,
        pace,
        openEvent,
        location,
        limitParticipants,
        initiator: req.user._id,
        participants: [req.user._id],
      });

      await PostsDBService.updatePost(post._id, { event: eventDoc._id });
      post = await PostsDBService.getPost({
        _id: post._id,
        select: '-__v -updated_at',
        populate: { author: true, comments: true, event: true },
      });
      return { data: post };
    } catch (error) {
      return { errors: [{ msg: error?.message }] };
    }
  }
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
  return await PostsDBService.getPost({
    _id: req.params.id,
    select: '-__v -updated_at',
    populate: { author: true, comments: true, event: true },
  });
};

// @desc     Delete post
// @route    Delete /api/posts/:id
// @access   Private

const deletePost = async (req: Request, res: Response, next: NextFunction) => {
  await PostsDBService.deletePost(req.params.id);

  return { msg: 'Removed post' };
};

// // @desc     Gets comment for specific post
// // @route    GET /api/posts/:id/comments
// // @access   Public

// exports.getComments = async (req: any, res: Response, next: NextFunction) => {
//   const post = await Post.findOne({ _id: req.params.id }).populate(
//     'comments.user'
//   );
//   if (!post) return res.status(404).json({ msg: 'No post found' });

//   res.status(200).json({
//     data: post.comments,
//   });
// };

// // @desc     Creates a comment for specific post
// // @route    POST /api/posts/:id/comments
// // @access   Private

// exports.createComment = async (req: any, res: Response, next: NextFunction) => {
//   if (mongoose.Types.ObjectId.isValid(req.params.id)) {
//     let post = await Post.findById(req.params.id).populate(
//       'comments.user',
//       'name lastname _id'
//     );
//     if (!post) return res.status(404).json({ msg: 'No post found' });
//     let user = await User.findById(req.user);
//     let newComment = {
//       _id: mongoose.Types.ObjectId(),
//       post: req.params.id,
//       user: user._id,
//       text: req.body.comment,
//     };
//     post.comments.push(newComment);
//     await post.save();

//     newComment.user = {
//       name: user.name,
//       lastname: user.lastname,
//       _id: user._id,
//     };

//     let updatedPost = await Post.findById(req.params.id).populate(
//       'comments.user',
//       'name lastname _id created_at'
//     );

//     let comment = updatedPost.comments.find(
//       (v: any) => v._id.toString() === newComment._id.toString()
//     );

//     return res
//       .status(200)
//       .json({ data: comment, msg: 'Your comment has been added.' });
//   }
//   return res.status(404).json({ msg: 'Invalid post ID' });
// };

// // @desc     Edits a comment for specific post
// // @route    PUT /api/posts/:id/comments/:commentId
// // @access   Private

// exports.editComment = async (req: any, res: Response, next: NextFunction) => {
//   let post = await Post.findById(req.params.id);
//   if (!post) return res.status(404).json({ msg: 'No post found' });
//   // Find comment by subdoc id, edit its text and save the document
//   let comment = post.comments.id(req.body.commentId);
//   if (!comment) return res.status(404).json({ msg: 'No comment found' });
//   await comment.set({ ...comment, text: req.body.comment });
//   await post.save();
//   post = await Post.findById(req.params.id);
//   res.status(200).json({
//     data: post,
//     success: true,
//     action: `Edit a comment for post id:${req.params.id}`,
//   });
// };

// // @desc     Removes a comment from specific post
// // @route    DELETE /api/posts/:id/comments
// // @access   Private

// exports.removeComment = async (req: any, res: Response, next: NextFunction) => {
//   const post = await Post.findById(req.params.id);
//   const commentId = req.body.commentId;
//   let comment = post.comments.id(commentId);
//   if (!post) return res.status(404).json({ msg: 'No post found' });

//   if (
//     post.user.toString() !== req.user.toString() &&
//     post.comments.id(commentId).user.toString() !== req.user.toString()
//   ) {
//     // Both the comment and the post does not belong to the user trying to access the action
//     return res
//       .status(403)
//       .json({ msg: 'You are not allowed to remove this comment' });
//   }
//   // Two scenarios, let the post owner delete comments and also the comment user
//   comment = post.comments.id(commentId);
//   if (!comment) return res.status(404).json({ msg: 'No comment found' });
//   post.comments.pull({ _id: comment._id });
//   await post.save();
//   return res.status(200).json({ msg: 'Comment has been removed.' });
// };

// // @desc     Delete an event from post
// // @route    DELETE /api/posts/:id/event
// // @access   Private

// exports.removeEvent = async (req: any, res: Response, next: NextFunction) => {
//   const post = await Post.findById(req.params.id);
//   if (!post) return res.status(404).json({ msg: 'No post found' });
//   if (post.user._id != req.user)
//     return res
//       .status(403)
//       .json({ msg: 'You are not allowed to remove this event' });
//   post.isEvent = false;
//   post.save();
//   res.status(200).json({ msg: 'Removed an event from the post' });
// };

// exports.removeFromRejectedList = async (
//   req: any,
//   res: Response,
//   next: NextFunction
// ) => {
//   let post = await Post.findById(req.params.id);
//   if (!post || !post.isEvent)
//     return res
//       .status(404)
//       .json({ msg: 'No post found or the post is not an event.' });
//   if (String(post.user._id) !== String(req.user))
//     return res
//       .status(403)
//       .json({ msg: 'You are not allowed to use this function.' });
//   let { userId, entryId } = req.body;
//   let isRejected =
//     post.event.rejectedParticipants.findIndex(
//       (item: any) => String(item) === userId
//     ) !== -1;
//   if (isRejected) {
//     post.event.rejectedParticipants.pull({ _id: entryId });
//     post.save();
//     return res.status(200).json({
//       msg: 'Removed from rejected list.',
//     });
//   }
// };

// exports.allowAdmitEvent = async (
//   req: any,
//   res: Response,
//   next: NextFunction
// ) => {
//   let post = await Post.findById(req.params.id);
//   if (!post || !post.isEvent)
//     return res
//       .status(404)
//       .json({ msg: 'No post found or the post is not an event.' });
//   if (String(post.user._id) !== String(req.user))
//     return res
//       .status(403)
//       .json({ msg: 'You are not allowed to use this function.' });
//   let { userId, entryId } = req.body;
//   let isNotRejected =
//     post.event.rejectedParticipants.findIndex(
//       (item: any) => item.toString() === userId
//     ) === -1;
//   if (!isNotRejected) {
//     return res.status(400).json({
//       msg:
//         'This person has been rejected from that event, first remove him from the rejected list.',
//     });
//   }
//   let user = await User.findById(String(userId));
//   let participant = user._id;
//   post.event.participants.push(participant);
//   post.event.awaitingApprovalParticipants.pull({ _id: entryId });
//   post.save();
//   post = await Post.findById(req.params.id);
//   return res.status(200).json({ msg: 'Participant added', post });
// };

// exports.rejectAdmitEvent = async (
//   req: any,
//   res: Response,
//   next: NextFunction
// ) => {
//   let post = await Post.findById(req.params.id);
//   if (!post) return res.status(404).json({ msg: 'No post found' });
//   if (String(post.user._id) !== String(req.user))
//     return res
//       .status(403)
//       .json({ msg: 'You are not allowed to use this function.' });
//   let { userId, entryId } = req.body;
//   let isNotRejected =
//     post.event.rejectedParticipants.findIndex(
//       (item: any) => item.toString() === userId
//     ) === -1;
//   if (!isNotRejected) {
//     return res.status(400).json({
//       msg:
//         'This person has been rejected from that event, first remove him from the rejected list.',
//     });
//   }
//   let user = await User.findById(req.user);
//   let participant = {
//     id: user._id,
//     avatar: user.avatar,
//     name: user.name,
//   };
//   post.event.rejectedParticipants.push(participant);
//   post.event.awaitingApprovalParticipants.pull({ _id: entryId });
//   post.save();
//   post = await Post.findById(req.params.id);
//   return res.status(200).json({ msg: 'Participant rejected.', post });
// };

// exports.askToJoinEvent = async (
//   req: any,
//   res: Response,
//   next: NextFunction
// ) => {
//   let post = await Post.findById(req.params.id);
//   if (!post) return res.status(404).json({ msg: 'No post found' });
//   if (post.user._id == req.user)
//     return res
//       .status(403)
//       .json({ msg: 'You are not allowed to use this function.' });
//   let isNotRejected =
//     post.event.rejectedParticipants.findIndex(
//       (item: any) => item.toString() === req.user
//     ) === -1;
//   if (!isNotRejected) {
//     return res
//       .status(403)
//       .json({ msg: 'You are forbidden from using this function.' });
//   } else if (
//     !post.event.openEvent &&
//     !post.event.participants.includes(req.user)
//   ) {
//     let user = await User.findById(req.user);
//     let participant = {
//       id: user._id,
//       avatar: user.avatar,
//       name: user.name,
//     };
//     post.event.awaitingApprovalParticipants.push(participant);
//     post.save();
//     post = await Post.findById(req.params.id);
//     return res
//       .status(200)
//       .json({ msg: "You've asked to join the event", participant });
//   }
//   return res.status(418).json({ msg: 'Teapot here' });
// };

// exports.joinEvent = async (req: any, res: Response, next: NextFunction) => {
//   let post = await Post.findById(req.params.id);
//   if (!post) return res.status(404).json({ msg: 'No post found' });
//   if (post.user._id == req.user)
//     return res
//       .status(403)
//       .json({ msg: 'You are not allowed to use this function.' });
//   let isNotAwaiting =
//     post.event.awaitingApprovalParticipants.findIndex(
//       (item: any) => item.toString() === req.user
//     ) === -1;
//   let isNotParticipant =
//     post.event.participants.findIndex(
//       (item: any) => item.toString() === req.user
//     ) === -1;
//   let isNotRejected =
//     post.event.rejectedParticipants.findIndex(
//       (item: any) => item.toString() === req.user
//     ) === -1;
//   if (!isNotRejected) {
//     return res
//       .status(403)
//       .json({ msg: 'You are forbidden from using this function.' });
//   } else if (post.event.openEvent && isNotAwaiting && isNotParticipant) {
//     let user = await User.findById(req.user);
//     let participant = {
//       id: user._id,
//       avatar: user.avatar,
//       name: user.name,
//     };
//     post.event.participants.push(participant);
//     post.save();
//     post = await Post.findById(req.params.id);
//     return res
//       .status(200)
//       .json({ msg: "You've joined the event", participant });
//   }
//   return res.status(418).json({ msg: 'Teapot here' });
// };

// exports.leaveEvent = async (req: any, res: Response, next: NextFunction) => {
//   let post = await Post.findById(req.params.id);
//   if (!post) return res.status(404).json({ msg: 'No post found' });
//   let isParticipant =
//     post.event.participants.findIndex(
//       (item: any) => String(item.toString()) === String(req.user)
//     ) >= 0;
//   if (post.user._id == req.user)
//     return res
//       .status(403)
//       .json({ msg: 'You are not allowed to use this function.' });
//   let isNotRejected =
//     post.event.rejectedParticipants.findIndex(
//       (item: any) => item.toString() === req.user
//     ) === -1;
//   if (!isNotRejected) {
//     return res
//       .status(403)
//       .json({ msg: 'You are forbidden from using this function.' });
//   } else if (isParticipant) {
//     const { entryId } = req.body;
//     post.event.participants.pull({ _id: entryId });
//     post.save();
//     post = await Post.findById(req.params.id);
//     return res.status(200).json({ msg: "You've left the event" });
//   }
//   return res.status(418).json({ msg: 'Teapot here' });
// };

// // @desc     Share post
// // @route    POST /api/posts/:id
// // @access   Private

// exports.sharePost = async (req: any, res: Response, next: NextFunction) => {
//   let user = await User.findById(req.user);
//   if (!user) return res.status(404).json({ msg: 'No user found' });
//   let post = await Post.findById(req.params.id);
//   if (!post || post.user._id === user._id)
//     return res
//       .status(400)
//       .json({ msg: 'No post found or it is your own post.' });
//   if (!user.sharedPosts.includes(post._id)) {
//     user.sharedPosts.push(post._id);
//     user.save();
//     return res.status(200).json({ msg: 'Success', post });
//   } else {
//     return res.status(400).json({ msg: 'Fail' });
//   }
// };

// // @desc     Unshare post
// // @route    POST /api/posts/:id
// // @access   Private

// exports.unsharePost = async (req: any, res: Response, next: NextFunction) => {
//   let user = await User.findById(req.user);
//   if (!user) return res.status(404).json({ msg: 'No user found' });
//   let post = await Post.findById(req.params.id);
//   if (!post || post.user._id === user._id)
//     return res
//       .status(400)
//       .json({ msg: 'No post found or it is your own post.' });
//   if (user.sharedPosts.includes(post._id)) {
//     user.sharedPosts.pull(post._id);
//     user.save();
//     return res.status(200).json({ msg: 'Success', post: post._id });
//   } else {
//     return res.status(400).json({ msg: 'Fail' });
//   }
// };

// // @desc     Like post
// // @route    POST /api/posts/:id/like
// // @access   Private

// exports.likePost = async (req: any, res: Response, next: NextFunction) => {
//   let user = await User.findById(req.user);
//   if (!user) return res.status(404).json({ msg: 'No user found' });
//   let post = await Post.findById(req.params.id).populate(
//     'user',
//     'avatar name lastname _id'
//   );
//   if (!post || post.user._id === user._id)
//     return res
//       .status(400)
//       .json({ msg: 'No post found or it is your own post.' });
//   if (!post.likes.includes(user._id.toString())) {
//     post.likes.push(user._id);
//     post.save();
//     return res.status(200).json({ msg: 'Success', post });
//   } else {
//     return res.status(400).json({ msg: 'Already liked' });
//   }
// };

// // @desc     Dislike post
// // @route    POST /api/posts/:id/dislike
// // @access   Private

// exports.dislikePost = async (req: any, res: Response, next: NextFunction) => {
//   let user = await User.findById(req.user);
//   if (!user) return res.status(404).json({ msg: 'No user found' });
//   let post = await Post.findById(req.params.id).populate(
//     'user',
//     'avatar name lastname _id'
//   );
//   if (!post || post.user._id === user._id)
//     return res
//       .status(400)
//       .json({ msg: 'No post found or it is your own post.' });
//   if (post.likes.includes(user._id.toString())) {
//     post.likes.pull(user._id.toString());
//     post.save();
//     return res.status(200).json({ msg: 'Success', post });
//   } else {
//     return res.status(400).json({ msg: 'Can not dislike' });
//   }
// };

export default { getPosts, getPost, createPost, deletePost, updatePost };
