import UsersDBService from '../services/Users';
import FriendsDBService from '../services/Friends';
import { Request } from 'express';
import compress from '../utils/compress';
import { IBefriendRequest } from '../models/BefriendRequest';

const getUser = async (req: Request) => {
	let data = await UsersDBService.getUser({
		filter: { _id: req.params.id },
		select: '-__v -updated_at -fcmToken',
	});
	let friends = (
		await FriendsDBService.getFriends({ _id: req.params._id })
	).map((v: IBefriendRequest) =>
		v.from === req.user._id ? v.to.toString() : v.from.toString()
	);

	return { data: { ...data, friends } };
};

const getMyProfile = async (req: Request) => {
	let data = await UsersDBService.getUser({
		filter: { _id: req.user.id },
		select: '-__v -updated_at -fcmToken',
	});
	let friends = (await FriendsDBService.getFriends({ _id: req.user._id })).map(
		(v: IBefriendRequest) =>
			v.from === req.user._id ? v.to.toString() : v.from.toString()
	);
	let befriendRequests = await FriendsDBService.getUserRequests(
		req.user._id,
		'pending'
	);
	return { data: { ...data, friends, befriendRequests } };
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
