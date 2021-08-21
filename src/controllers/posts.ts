import { Request } from 'express';
import { IPost } from '../models/Post';
import PostsDBService from '../services/Posts';
import EventsDBService from '../services/Events';
import FriendsDBService from '../services/Friends';
import CommentsDBService from '../services/Comments';
import GroupDBService from '../services/Groups';
import UsersDBService from '../services/Users';
import { IObject } from '../types/IObject';
import compress from '../utils/compress';
import { IBefriendRequest } from '../models/BefriendRequest';

const getStatistics = async (req: Request) => {
	let users = await UsersDBService.count({});
	let posts = await PostsDBService.count({});
	let comments = await CommentsDBService.count({});
	let events = await EventsDBService.count({});
	let groups = await GroupDBService.count({});
	let result = {
		posts,
		users,
		comments,
		groups,
		events,
	};
	return { data: result };
};

const getPosts = async (req: Request) => {
	const { offset, limit, userId, sports } = req.query;
	let friends = (
		await FriendsDBService.getAcceptedFriendsRequests({ _id: req.user._id })
	).map((v: IBefriendRequest) =>
		v.from === req.user._id ? v.to.toString() : v.from.toString()
	);

	let privateFilter: IObject = {
		display: 'friends',
		author: { $in: [...friends, req.user._id] },
	};

	let publicFilter: IObject = {
		display: 'all',
	};

	let eventFilter: IObject = {};

	if (sports) {
		(eventFilter.event = { $exists: true }),
			(eventFilter.eventType = {
				$in: typeof sports === 'string' ? sports.split(',') : sports,
			});
	}

	let posts = await PostsDBService.getPosts({
		offset: +offset,
		limit: +limit,
		filter: {
			...(userId && { author: userId }),
			$and: [{ $or: [privateFilter, publicFilter] }, eventFilter],
		},
		select: '-__v -updated_at',
		populate: { author: true, comments: true, event: true },
		sort: { created_at: -1 },
	});

	return { data: posts };
};

const getUsersPosts = async (req: Request) => {
	let friends = (
		await FriendsDBService.getAcceptedFriendsRequests({ _id: req.user._id })
	).map((v: IBefriendRequest) =>
		v.from === req.user._id ? v.to.toString() : v.from.toString()
	);
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
	let {
		text,
		group,
		display,
		eventType,
		limitParticipants,
		openEvent,
		pace,
		startDate,
		address,
		coordinates,
	} = req.body;
	let postData: IPost = {
		author: req.user._id,
		display,
		text,
	};

	if (req.file) {
		postData.image = await compress(req.user._id, req.file);
	}

	if (group) postData.group = group;

	if (
		startDate &&
		eventType &&
		limitParticipants &&
		openEvent !== undefined &&
		pace
	) {
		try {
			let eventDoc = await EventsDBService.createEvent({
				participants: [req.user._id],
				eventType,
				limitParticipants,
				openEvent,
				pace,
				startDate,
				address,
				coordinates: {
					type: 'Point',
					coordinates,
				},
			});
			await PostsDBService.createPost({
				...postData,
				eventType,
				event: eventDoc._id,
			});

			return;
		} catch (error) {
			return { errors: [{ msg: error?.message }] };
		}
	} else {
		await PostsDBService.createPost(postData);
	}
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
	if (post.comments.length)
		await CommentsDBService.deletePostsComments(post._id);
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
