import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Notification from '../models/Notification';

const getNotifications = async (req: any, res: Response, next: NextFunction) => {
  let list = await Notification.find({ user: req.user })
    .populate('friend', 'name lastname image')
    .sort('-created_at')
    .exec();
  return { data: list };
};

const getNotificationsCount = async (req: any, res: Response, next: NextFunction) => {
  let count = await Notification.count({ user: req.user, read: false });
  return { data: count };
};
const getSingleNotification = async (req: any, res: Response, next: NextFunction) => {
  let notification = await Notification.findById(req.params.id)
    .populate('user')
    .populate('friend')
    .exec();
  if (!notification) return res.status(400);
  return { data: notification };
};

const markAsRead = async (req: any, res: Response, next: NextFunction) => {
  let notification = await Notification.findById(req.params.id);

  if (!notification) return res.status(400);

  notification.read = true;
  await notification.save();

  return { msg: 'Marked as read' };
};

const deleteNotification = async (req: any, res: Response, next: NextFunction) => {
  let notification = await Notification.findById(req.params.id);

  if (!notification) return res.status(400);

  await Notification.deleteOne({ _id: req.params.id });

  return { msg: 'Deleted notification' };
};

export default {
  getNotifications,
  getNotificationsCount,
  getSingleNotification,
  markAsRead,
  deleteNotification,
};
