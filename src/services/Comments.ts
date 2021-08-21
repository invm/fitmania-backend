import Comment, { IComment } from '../models/Comment';
import { IObject } from '../types/IObject';

const getComment = async (_id: string) => {
	return Comment.findOne({ _id });
};

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

const deletePostsComments = async (_id: string) => {
	return Comment.deleteMany({ post: _id });
};

const exists = async (_id: string, filters: IObject) => {
	let result = await Comment.findOne({ _id, ...filters }).lean();
	return !!result;
};

const count = async (filter: IObject) => {
	return Comment.countDocuments(filter);
};

export default {
	getComment,
	getComments,
	createComment,
	updateComment,
	deleteComment,
	exists,
	deletePostsComments,
	count,
};
