import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Notification from '../models/Notification';
import Group from '../models/Group';
import FriendsDBService from '../services/Friends';
import UserDBService from '../services/User';

const addFriend = async (req: Request) => {
  await FriendsDBService.askToBefriend(req.user._id, req.params.id);

  // TODO: create notification
  // await Notification.create({
  //   user: req.params.id,
  //   type: 'friend',
  //   friend: req.user._id,
  //   title: 'New friend request!',
  //   body: `You've received a new friend request from ${req.params.name}.`,
  // });

  return { msg: 'Request sent' };
};

const removeFriend = async (req: Request) => {
  await FriendsDBService.removeFriend(req.user._id, req.params.id);
  return { msg: 'Removed friend' };
};

const rejectRequest = async (req: Request) => {
  await FriendsDBService.rejectRequest(req.params.id, req.user._id);

  await Notification.updateOne(
    { _id: req.body.notificationId },
    {
      responded: true,
      read: true,
    }
  );

  return { msg: 'Request rejected' };
};

const acceptRequest = async (req: Request) => {
  await FriendsDBService.acceptRequest(req.params.id, req.user._id);

  return { msg: 'Accepted request' };
};

// exports.search = async (req: any, res: Response, next: NextFunction) => {
//   let query = req.query.q;
//   if (!query) return res.status(200).json({ success: true });
//   let user = await User.findById(req.user);
//   let users = await User.find({
//     $and: [
//       {
//         _id: {
//           $nin: [user._id],
//         },
//       },
//       {
//         $or: [
//           { name: { $regex: query, $options: 'i' } },
//           { lastname: { $regex: query, $options: 'i' } },
//           { email: { $regex: query, $options: 'i' } },
//           { location: { $regex: query, $options: 'i' } },
//         ],
//       },
//     ],
//   }).select('avatar name lastname email location');

//   let groups = await Group.find({
//     $and: [
//       {
//         $or: [
//           { title: { $regex: query, $options: 'i' } },
//           { description: { $regex: query, $options: 'i' } },
//           { sport: { $regex: query, $options: 'i' } },
//         ],
//       },
//     ],
//   }).select('title sport description users');

//   return res.status(200).json({ success: true, users, groups });
// };
// // @desc     Get friends suggestions based on your sport preferences and location
// // @route    GET /social/friends/suggestions
// // @access   Private

const getFriendSuggestions = async (req: Request) => {
  let data = await FriendsDBService.getFriendSuggestions(req.user._id);

  return { data };
};

const getRequests = async (req: Request) => {
  let data = await FriendsDBService.getUserRequests(req.user._id, 'pending');

  return { data };
};

export default {
  addFriend,
  rejectRequest,
  removeFriend,
  acceptRequest,
  getFriendSuggestions,
  getRequests,
};
