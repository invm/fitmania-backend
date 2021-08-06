import { Request, Response, NextFunction } from 'express';
import FriendsDBService from '../services/Friends';
import UsersDBService from '../services/Users';
import NotificationsDBService from '../services/Notifications';
import { IBefriendRequest } from '../models/BefriendRequest';

const addFriend = async (req: Request) => {
	await FriendsDBService.askToBefriend(req.user._id, req.params.id);

	await NotificationsDBService.createNotification({
		from: req.params.id,
		type: 'friendRequest',
		to: req.user._id,
		title: 'New friend request!',
		body: `You've received a new friend request from ${req.params.name}.`,
	});

	return { msg: 'Request sent' };
};

const removeFriend = async (req: Request) => {
	await FriendsDBService.removeFriend(req.user._id, req.params.id);
	return { msg: 'Removed friend' };
};

const rejectRequest = async (req: Request) => {
	await FriendsDBService.rejectRequest(req.params.id, req.user._id);

	return { msg: 'Request rejected' };
};

const acceptRequest = async (req: Request) => {
	await FriendsDBService.acceptRequest(req.params.id, req.user._id);

	await NotificationsDBService.createNotification({
		from: req.user._id,
		type: 'friendRequest',
		to: req.params.id,
		title: 'New friend request!',
		body: `You are now friends with ${req.user?.name} ${req.user?.lastname}.`,
	});

	return { msg: 'Accepted request' };
};

const search = async (req: Request) => {
	let { q, offset, limit } = req.query;
	let users = await UsersDBService.getUsers({
		offset: +offset,
		limit: +limit,
		filter: {
			$and: [
				{
					_id: {
						$nin: [req.user._id],
					},
				},
				{
					$or: [
						{ name: { $regex: q, $options: 'i' } },
						{ lastname: { $regex: q, $options: 'i' } },
						{ email: { $regex: q, $options: 'i' } },
						{ location: { $regex: q, $options: 'i' } },
					],
				},
			],
		},
		select: 'image name lastname email location',
	});

	// let groups = await Group.find({
	//   $and: [
	//     {
	//       $or: [
	//         { title: { $regex: q, $options: 'i' } },
	//         { description: { $regex: q, $options: 'i' } },
	//         { sport: { $regex: q, $options: 'i' } },
	//       ],
	//     },
	//   ],
	// }).select('title sport description users');

	return { data: { users } };
};

const getFriendSuggestions = async (req: Request) => {
	let data = await FriendsDBService.getFriendSuggestions(req.user._id);

	return { data };
};

const getRequests = async (req: Request) => {
	let data = await FriendsDBService.getUserRequests(req.user._id, 'pending', {
		path: 'from',
		select: '-__v -updated_at -fcmToken',
	});

	return { data };
};

const getAcceptedFriendsRequests = async ({ query, user }: Request) => {
	let data = await FriendsDBService.getAcceptedFriendsRequests({
		_id: user._id,
		offset: +query.offset,
		limit: +query.limit,
	});

	return { data };
};

const getFriends = async ({ query, user }: Request) => {
	let friends = (
		await FriendsDBService.getAcceptedFriendsRequests({
			_id: user._id,
			offset: +query.offset,
			limit: +query.limit,
		})
	).map((v: IBefriendRequest) =>
		v.from.toString() === user._id.toString() ? v.to : v.from
	);

	let data = await UsersDBService.getUsers({
		offset: +query.offset,
		limit: +query.limit,
		filter: { _id: { $in: friends } },
	});

	return { data };
};

export default {
	addFriend,
	rejectRequest,
	removeFriend,
	acceptRequest,
	getFriendSuggestions,
	getRequests,
	search,
	getAcceptedFriendsRequests,
	getFriends,
};
