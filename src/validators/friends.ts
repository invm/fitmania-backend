import { check } from 'express-validator';
import { entityExists, paginationQuery } from '.';
import Errors from '../config/Errors';
import ENTITIES from '../models';
import FriendsDBService from '../services/Friends';

export = {
	getAcceptedFriendsRequests: [...paginationQuery],

	getRequests: [...paginationQuery],

	getFriends: [...paginationQuery],

	acceptRequest: [
		check('id')
			.custom(async (val, { req }) => {
				let request = await FriendsDBService.getRequest(
					val,
					req.user._id,
					'pending'
				);
				if (!request) throw new Error();
				return true;
			})
			.withMessage(Errors.A38)
			.bail(),
	],

	rejectRequest: [
		check('id')
			.custom(async (val, { req }) => {
				let request = await FriendsDBService.getRequest(
					val,
					req.user._id,
					'pending'
				);
				if (!request) throw new Error();
				return true;
			})
			.withMessage(Errors.A38)
			.bail(),
	],

	addFriend: [
		check('id')
			.custom(async (val, { req }) => {
				let iAsked = await FriendsDBService.getRequest(req.user._id, val, {
					$in: ['pending', 'accepted'],
				});
				let heAsked = await FriendsDBService.getRequest(val, req.user._id, {
					$in: ['pending', 'accepted'],
				});
				if (iAsked || heAsked) throw new Error();
				return true;
			})
			.withMessage(Errors.A35)
			.bail(),
	],

	removeFriend: [
		check('id')
			.custom(async (val, { req }) => {
				let areFriends = await FriendsDBService.areFriends(val, req.user._id);
				if (!areFriends) throw new Error();
				return true;
			})
			.withMessage(Errors.A39)
			.bail(),
	],

	search: [
		...paginationQuery,
		check('q')
			.isString()
			.isLength({ max: 100, min: 1 })
			.withMessage(Errors.A0)
			.bail(),
	],
};
