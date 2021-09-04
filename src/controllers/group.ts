/* Groups use cases functions */

import { Request } from 'express';
import PostsDBService from '../services/Posts';
import GroupDBService from '../services/Groups';
import UsersDBService from '../services/Users';
import { IObject } from '../types/IObject';

const getGroups = async (req: Request) => {
	let { offset, limit } = req.query;
	let filter = {};
	if (req.query.sports) {
		filter = {
			sport: {
				$in: req.query.sports,
			},
		};
	}
	let data = await GroupDBService.getGroups({
		filter,
		offset: +offset,
		limit: +limit,
		populate: true,
	});
	return { data };
};

const getGroup = async (req: Request) => {
	let data = await GroupDBService.getGroup(
		{ _id: req.params.id },
		{ populate: true }
	);
	return { data };
};

const getFeaturedGroups = async (req: Request) => {
	let filter = {};
	let user = await UsersDBService.getUser({ filter: { _id: req.user._id } });
	if (user.preferable.length > 0)
		filter = {
			sport: {
				$in: user.preferable,
			},
		};

	let data = await GroupDBService.getGroups({
		filter,
		offset: 0,
		limit: 3,
		populate: true,
	});
	return { data };
};

const getGroupPosts = async (req: Request) => {
	// let data = await Post.find({ group: req.params.id })
	// 	.populate('user', 'name lastname image')
	// 	.populate('event.participants', 'name lastname image')
	// 	.populate('event.rejectedParticipants', 'name lastname image')
	// 	.populate('event.pendingApprovalParticipants', 'name lastname image')
	// 	.populate('comments.user', 'name lastname _id')
	// 	.exec();
	const { offset, limit } = req.query;

	let posts = await PostsDBService.getPosts({
		offset: +offset,
		limit: +limit,
		filter: {
			group: req.params.id,
		},
		select: '-__v -updated_at',
		populate: { author: true, comments: true, event: true },
		sort: { created_at: -1 },
	});
	return { data: posts };
};

const createGroup = async (req: Request) => {
	let { title, sport, description } = req.body;
	let data = await GroupDBService.createGroup({
		title,
		sport,
		description,
		users: [req.user._id],
		admin: req.user._id,
	});

	return { data };
};

const updateGroup = async (req: Request) => {
	let updateParams: IObject = {};
	if (req.body.title) updateParams.title = req.body.title;
	if (req.body.sport) updateParams.sport = req.body.sport;
	if (req.body.description) updateParams.description = req.body.description;

	let data = await GroupDBService.updateGroup(req.params.id, updateParams);
	return { data };
};

const deleteGroup = async (req: Request) => {
	await GroupDBService.deleteGroup(req.params.id);
	return { msg: 'Deleted group' };
};

const joinGroup = async (req: Request) => {
	let data = await GroupDBService.joinGroup(req.params.id, req.user._id);
	return { msg: 'Joined group', data };
};

const leaveGroup = async (req: Request) => {
	let data = await GroupDBService.leaveGroup(req.params.id, req.user._id);
	return { msg: 'Left group', data };
};

export default {
	getFeaturedGroups,
	getGroups,
	getGroup,
	getGroupPosts,
	createGroup,
	updateGroup,
	deleteGroup,
	joinGroup,
	leaveGroup,
};
