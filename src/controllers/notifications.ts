import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import Notification from "../models/Notification";

// @desc     Get all user notifications
// @route    GET /notifications/list
// @access   Private

exports.getNotifications = async (
	req: any,
	res: Response,
	next: NextFunction
) => {
	let list = await Notification.find({ user: req._user })
		.populate("friend", "name lastname avatar")
		.sort("-created_at")
		.exec();
	return res.status(200).json({ success: true, list });
};

// @desc     Get all user notifications count
// @route    GET /notifications/list
// @access   Private

exports.getNotificationsCount = async (
	req: any,
	res: Response,
	next: NextFunction
) => {
	let count = await Notification.count({ user: req._user, read: false });
	return res.status(200).json({ success: true, count });
};
// @desc     Get all user notifications
// @route    GET /notifications/list
// @access   Private

exports.getSingleNotification = async (
	req: any,
	res: Response,
	next: NextFunction
) => {
	let notification = await Notification.findById(req.params.id)
		.populate("user")
		.populate("friend")
		.exec();
	if (!notification) return res.status(400);
	return res.status(200).json({ success: true, notification });
};

// @desc     Get all user notifications
// @route    GET /notifications/list
// @access   Private

exports.markAsRead = async (req: any, res: Response, next: NextFunction) => {
	let notification = await Notification.findById(req.params.id);

	if (!notification) return res.status(400);

	notification.read = true;
	await notification.save();

	return res.status(200).json({ success: true });
};

// @desc     Get all user notifications
// @route    GET /notifications/list
// @access   Private

exports.deleteNotification = async (
	req: any,
	res: Response,
	next: NextFunction
) => {
	let notification = await Notification.findById(req.params.id);

	if (!notification) return res.status(400);

	await Notification.deleteOne({ _id: req.params.id });

	return res.status(200).json({ success: true });
};
