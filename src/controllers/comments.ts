/* Comments use cases functions */
import { Request } from 'express';
import CommentsDBService from '../services/Comments';
import NotificationsDBService from '../services/Notifications';
import PostsDBService from '../services/Posts';
import { newCommentNotification } from '../services/utils';

const getComments = async (req: Request) => {
	return { data: await CommentsDBService.getComments(req.params.id) };
};

const createComment = async (req: Request) => {
	let comment = await CommentsDBService.createComment({
		post: req.params.id,
		user: req.user._id,
		text: req.body.text,
	});

	await PostsDBService.addComment(req.params.id, comment._id).then(() => {
		newCommentNotification(req.params.id, req.user._id);
	});

	return { data: comment };
};

const editComment = async (req: Request) => {
	await CommentsDBService.updateComment(req.params.commentId, {
		text: req.body.text,
	});
};

const removeComment = async (req: Request) => {
	await CommentsDBService.deleteComment(req.params.commentId);
	await PostsDBService.removeComment(req.params.id, req.params.commentId);
};

export default { getComments, createComment, removeComment, editComment };
