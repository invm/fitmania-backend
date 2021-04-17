import Post, { IPost } from '../models/Post';
import '../models/Comment';

let userSelect = 'name lastname avatar';

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

  return query;
};

const createPost = async (params: IPost) => {
  return Post.create(params);
};

const updatePost = async (_id: string, params: IPost) => {
  return Post.updateOne({ _id }, { $set: params });
};

const deletePost = async (_id: string) => {
  return Post.deleteOne({ _id });
};

export default { getPost, getPosts, createPost, updatePost, deletePost };
