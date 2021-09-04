/* User use cases functions*/

import UsersDBService from '../services/Users';
import FriendsDBService from '../services/Friends';
import GroupsDBService from '../services/Groups';
import { Request } from 'express';
import compress from '../utils/compress';
import { IBefriendRequest } from '../models/BefriendRequest';

const getUser = async (req: Request) => {
	let data = await UsersDBService.getUser({
		filter: { _id: req.params.id },
		select: '-__v -updated_at -fcmToken',
	});

	let _friends = (
		await FriendsDBService.getAcceptedFriendsRequests({ _id: req.params.id })
	).map((v: IBefriendRequest) =>
		v.from === req.params.id ? v.from.toString() : v.to.toString()
	);

	let friends = await UsersDBService.getUsers({
		skipPagination: true,
		filter: {
			_id: { $in: _friends },
		},
	});

	let groups = await GroupsDBService.getGroups({
		filter: {
			users: req.params.id
		}
	})

	return { data: { ...data, friends, groups } };
};

const getMyProfile = async (req: Request) => {
	let data = await UsersDBService.getUser({
		filter: { _id: req.user.id },
		select: '-__v -updated_at -fcmToken',
	});
	let _friends = (
		await FriendsDBService.getAcceptedFriendsRequests({ _id: req.user._id })
	).map((v: IBefriendRequest) =>
		v.from === req.user._id ? v.to.toString() : v.from.toString()
	);
	let befriendRequests = await FriendsDBService.getUserRequests(
		req.user._id,
		'pending'
	);

	let myRequests = (
		await FriendsDBService.getRequestsFromUser(req.user._id, 'pending')
	).map((v: IBefriendRequest) => v.to.toString());

	let friends = await UsersDBService.getUsers({
		skipPagination: true,
		filter: {
			_id: { $in: _friends },
		},
	});

	let groups = await GroupsDBService.getGroups({
		filter: {
			users: req.user.id
		}
	})

	return { data: { ...data, friends, befriendRequests, myRequests, groups } };
};

const updateUser = async (req: Request) => {
	const updateFields: any = {
		...req.body,
	};

	if (req.file) {
		updateFields.image = await compress(req.user._id, req.file);
	}

	if (Object.keys(updateFields).length > 0) {
		await UsersDBService.updateUser({
			filter: { _id: req.user._id },
			params: updateFields,
		});
		let user = await UsersDBService.getUser({
			filter: { _id: req.user._id },
		});
		return { data: user };
	}
};

export default {
	getUser,
	updateUser,
	getMyProfile,
};
