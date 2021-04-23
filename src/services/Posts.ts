import Post, { IPost } from '../models/Post';
import '../models/Comment';
import { IObject } from '../types/IObject';

let userSelect = 'name lastname avatar';

const exists = async (_id: string, filters: IObject) => {
  let result = await Post.findOne({ _id, ...filters }).lean();
  console.log('resut', result);
  
  return !!result;
};

/**
 *
 * @param obj can pass offset, limit, filter, select and populate objects or strings
 * @returns
 */

const getPosts = async ({
  offset,
  limit,
  filter = {},
  select,
  populate,
  sort,
}: {
  offset: number;
  limit: number;
  filter?: {};
  select?: {} | string;
  populate?: {
    author?: boolean;
    comments?: boolean;
    event?: boolean;
  };
  sort?: {} | string;
}) => {
  let query = Post.find(filter)
    .skip(offset * limit)
    .limit(limit);

  if (select) query.select(select);

  if (populate.comments)
    query.populate({
      path: 'comments.user',
      select: (userSelect += ' _id created_at'),
    });

  if (populate.event)
    query.populate({
      path: 'event',
      populate: [
        {
          path: 'participants',
          select: userSelect,
        },
        {
          path: 'initiator',
          select: userSelect,
        },
        {
          path: 'rejectedParticipants',
          select: userSelect,
        },
        {
          path: 'awaitingApprovalParticipants',
          select: userSelect,
        },
      ],
    });

  if (populate.author) query.populate({ path: 'author', select: userSelect });

  if (sort) query.sort(sort);

  return query;
};

const getPost = async ({
  _id,
  select,
  populate,
}: {
  _id: string;
  select?: {} | string;
  populate?: {
    author?: boolean;
    comments?: boolean;
    event?: boolean;
  };
}) => {
  let query = Post.findOne({ _id });

  if (select) query.select(select);

  if (populate?.comments)
    query.populate({
      path: 'comments.user',
      select: (userSelect += ' _id created_at'),
    });

  if (populate?.event)
    query.populate({
      path: 'event',
      populate: [
        {
          path: 'participants',
          select: userSelect,
        },
        {
          path: 'initiator',
          select: userSelect,
        },
        {
          path: 'rejectedParticipants',
          select: userSelect,
        },
        {
          path: 'awaitingApprovalParticipants',
          select: userSelect,
        },
      ],
    });

  if (populate?.author) query.populate({ path: 'author', select: userSelect });

  return query;
};

const createPost = async (params: IPost) => {
  return Post.create(params);
};

const updatePost = async (_id: string, params: IPost) => {
  return Post.updateOne({ _id }, { $set: params });
};

const sharePost = async (_id: string, userId: string) => {
  return Post.updateOne({ _id }, { $push: { sharedBy: userId } });
};

const unsharePost = async (_id: string, userId: string) => {
  return Post.updateOne({ _id }, { $pull: { sharedBy: userId } });
};

const likePost = async (_id: string, userId: string) => {
  return Post.updateOne({ _id }, { $push: { likes: userId } });
};

const unlikePost = async (_id: string, userId: string) => {
  return Post.updateOne({ _id }, { $pull: { likes: userId } });
};

const deletePost = async (_id: string) => {
  return Post.deleteOne({ _id });
};

const addComment = async (_id: string, commentId: string) => {
  return Post.updateOne({ _id }, { $push: { comments: commentId } });
};

const removeComment = async (_id: string, commentId: string) => {
  return Post.updateOne({ _id }, { $pull: { comments: commentId } });
};

export default {
  exists,
  getPost,
  getPosts,
  createPost,
  updatePost,
  deletePost,
  sharePost,
  unsharePost,
  likePost,
  unlikePost,
  addComment,
  removeComment,
};
