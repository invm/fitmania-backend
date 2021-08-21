import Notification, { INotification } from '../models/Notification';
import { IObject } from '../types/IObject';

const exists = async (_id: string, filter: IObject) => {
	let result = await Notification.findOne({ _id, ...filter }).lean();
	return !!result;
};

const getNotifications = async ({
	filter,
	options,
	offset,
	limit,
}: {
	filter: IObject;
	options?: { populate: boolean };
	offset: number;
	limit: number;
}) => {
	let query = Notification.findOne(filter)
		.skip(offset * limit)
		.limit(limit);

	return query;
};

const deleteNotification = async (_id: string) => {
	await Notification.deleteOne({ _id });
};

const createNotification = async (notification: INotification) => {
	await Notification.create(notification);
};

export default {
	exists,
	getNotifications,
	deleteNotification,
	createNotification,
};
