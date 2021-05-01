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

const search = async (req: Request) => {
  let { q, offset, limit } = req.query;
  let users = await UserDBService.getUsers({
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
    select: 'avatar name lastname email location',
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
  search,
};
