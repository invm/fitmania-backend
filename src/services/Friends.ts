import BefriendRequest, { IBefriendRequest } from '../models/BefriendRequest';
import User from '../models/User';
import { IObject } from '../types/IObject';

const getAcceptedFriendsRequests = async ({
	_id,
	offset,
	limit,
}: {
	_id: string;
	offset?: number;
	limit?: number;
}) => {
	let query = BefriendRequest.find({
		$and: [{ $or: [{ from: _id }, { to: _id }] }, { state: 'accepted' }],
	});

	if (offset && limit) {
		query.skip(offset * limit).limit(limit);
	}

	return await query;
};

const areFriends = async (user1: string, user2: string) => {
	return !!(await BefriendRequest.findOne({
		$and: [
			{
				$or: [
					{ from: user1, to: user2 },
					{ from: user2, to: user1 },
				],
			},
			{ state: 'accepted' },
		],
	}));
};

const acceptRequest = async (from: string, to: string) => {
	await BefriendRequest.updateOne(
		{
			from,
			to,
			state: 'pending',
		},
		{ $set: { state: 'accepted' } }
	);
};

const rejectRequest = async (from: string, to: string) => {
	await BefriendRequest.updateOne(
		{
			from,
			to,
			state: 'pending',
		},
		{ $set: { state: 'rejected' } }
	);
};

const askToBefriend = async (from: string, to: string) => {
	await BefriendRequest.create({
		from,
		to,
	});
};

const removeFriend = async (user1: string, user2: string) => {
	await BefriendRequest.deleteOne({
		$and: [
			{
				$or: [
					{ from: user1, to: user2 },
					{ from: user2, to: user1 },
				],
			},
			{ state: 'accepted' },
		],
	});
};

const getFriendSuggestions = async (userId: string) => {
	let friends = (await getAcceptedFriendsRequests({ _id: userId })).map(
		(v: IBefriendRequest) =>
			v.from.toString() === userId.toString()
				? v.to.toString()
				: v.from.toString()
	);

	let requests = (
		await getRequestsFromUser(userId, {
			$in: ['pending', 'rejected'],
		})
	).map((v: IBefriendRequest) => v.to.toString());

	let myRequests = (
		await getUserRequests(userId, {
			$in: ['pending', 'rejected'],
		})
	).map((v: IBefriendRequest) => v.from.toString());

	let suggestions = await User.find({
		_id: { $nin: [friends, requests, myRequests, userId] },
	})
		.limit(6)
		.select('-fcmToken -updated_at -created_at');

	return suggestions;
};

const exists = async (filters: IObject) => {
	let result = await BefriendRequest.findOne(filters).lean();
	return !!result;
};

const getRequest = async (from: string, to: string, state: any) => {
	return BefriendRequest.findOne({ from, to, state });
};

const getUserRequests = async (to: string, state: any, populate?: any) => {
	let query = BefriendRequest.find({ to, state });
	if (populate) query.populate(populate);
	return await query;
};

const getRequestsFromUser = async (from: string, state: any) => {
	return BefriendRequest.find({ from, state });
};

export default {
	getAcceptedFriendsRequests,
	areFriends,
	exists,
	askToBefriend,
	removeFriend,
	acceptRequest,
	rejectRequest,
	getFriendSuggestions,
	getRequest,
	getUserRequests,
};
