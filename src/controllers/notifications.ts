/* Notifications use cases functions */

import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Notification from '../models/Notification';

const getNotifications = async (req: Request) => {
	let data = await Notification.find({ user: req.user._id }).sort(
		'-created_at'
	);

	await Notification.updateMany(
		{ user: req.user._id },
		{
			$set: {
				read: true,
			},
		}
	);
	return { data };
};

const getNotificationsCount = async (req: Request) => {
	let count = await Notification.countDocuments({
		user: req.user._id,
		read: false,
	});
	return { data: { count } };
};

const deleteNotification = async (req: Request) => {
	await Notification.deleteOne({ _id: req.params.id });
};

export default {
	getNotifications,
	getNotificationsCount,
	deleteNotification,
};
