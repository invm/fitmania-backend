import Post, { IPost } from '../models/Post';
import '../models/Comment';
import { IObject } from '../types/IObject';

const exists = async (_id: string, filters: IObject) => {
  let result = await Post.findOne({ _id, ...filters }).lean();
  return !!result;
};

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
    .limit(limit)

  if (select) query.select(select);

  if (populate.comments)
    query.populate({
      path: 'comments',
      select: '-post -updated_at -__v',
      populate: {
        path: 'user',
        select: 'name lastname avatar',
      },
    });

  if (populate.event)
    query.populate({
      path: 'event',
      populate: [
        {
          path: 'participants',
          select: 'name lastname avatar',
        },
        {
          path: 'rejectedParticipants',
          select: 'name lastname avatar',
        },
        {
          path: 'pendingApprovalParticipants',
          select: 'name lastname avatar',
        },
      ],
    });

  if (populate.author) query.populate({ path: 'author', select: 'name lastname avatar' });

  if (sort) query.sort(sort);

  return query;
};

const getPost = async (
  filter: IObject,
  options?: {
    select?: {} | string;
    populate?: {
      author?: boolean;
      comments?: boolean;
      event?: boolean;
      populateEventUsers?: boolean;
    };
  }
) => {
  let query = Post.findOne(filter);

  if (options?.select) query.select(options?.select);

  if (options?.populate?.comments)
    query.populate({
      path: 'comments',
      select: '-post -updated_at -__v',
      populate: {
        path: 'user',
        select: 'name lastname avatar',
      },
    });

  if (options?.populate?.event)
    query.populate({
      path: 'event',
      populate: options?.populate?.populateEventUsers
        ? [
            {
              path: 'participants',
              select: 'name lastname avatar',
            },
            {
              path: 'rejectedParticipants',
              select: 'name lastname avatar',
            },
            {
              path: 'pendingApprovalParticipants',
              select: 'name lastname avatar',
            },
          ]
        : [],
    });

  if (options?.populate?.author) query.populate({ path: 'author', select: 'name lastname avatar' });

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

const checkIfShared = async (_id: string, userId: string) => {
  return Post.findOne({ _id, sharedBy: userId });
};

const checkIfLiked = async (_id: string, userId: string) => {
  return Post.findOne({ _id, likes: userId });
};

const count = async (filter: IObject) => {
  return Post.countDocuments(filter);
};

export default {
  count,
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
  checkIfShared,
  checkIfLiked,
};
