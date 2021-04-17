import Comment, { IComment } from '../models/Comment';

const getComments = async (_id: string) => {
  return Comment.find({ post: _id });
};

const createComment = async (params: IComment) => {
  return Comment.create(params);
};

const updateComment = async (_id: string, params: IComment) => {
  return Comment.updateOne({ _id }, { $set: params });
};

const deleteComment = async (_id: string) => {
  return Comment.deleteOne({ _id });
};

export default { getComments, createComment, updateComment, deleteComment };
