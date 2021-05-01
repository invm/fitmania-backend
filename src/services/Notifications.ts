import Notification, { INotification } from '../models/Notification';
import { IObject } from '../types/IObject';

const exists = async (_id: string, filter: IObject) => {
  let result = await Notification.findOne({ _id, ...filter }).lean();
  return !!result;
};

const getNotification = async (filter: IObject, options?: { populate: boolean }) => {
  let query = Notification.findOne(filter);

  if (options?.populate) query.populate('from to', '_id name lastname avatar');

  return query;
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

  if (options?.populate) query.populate('from to', '_id name lastname avatar');

  return query;
};

const markAsRead = async (_id: string, responded?: boolean) => {
  let params: IObject = { read: true };
  if (responded) params = { ...params, responded: true };
  await Notification.updateOne({ _id }, { $set: params });
};

const deleteNotification = async (_id: string) => {
  await Notification.deleteOne({ _id });
};

const createNotification = async ({ from, to, title, type, body }: INotification) => {
  await Notification.create({ from, to, title, type, body });
};

export default {
  exists,
  getNotification,
  getNotifications,
  markAsRead,
  deleteNotification,
  createNotification,
};
