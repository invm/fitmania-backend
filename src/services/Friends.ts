import BefriendRequest, { IBefriendRequest } from '../models/BefriendRequest';
import User from '../models/User';
import { IObject } from '../types/IObject';

const getFriends = async (_id: string) => {
  let friendsIds = (
    await BefriendRequest.find({
      $and: [{ $or: [{ from: _id }, { to: _id }] }, { state: 'accepted' }],
    })
  ).map((v: IBefriendRequest) => (v.from === _id ? v.to.toString() : v.from.toString()));

  return friendsIds;
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
  let friends = await getFriends(userId);
  let suggestions = await User.find({ _id: { $nin: [friends, userId] } }).limit(5);
  // let suggestions = await User.aggregate([{ $sample: { size: 3 } }]);
  return suggestions;
};

const exists = async (filters: IObject) => {
  let result = await BefriendRequest.findOne(filters).lean();
  return !!result;
};

const getRequest = async (from: string, to: string, state: any) => {
  return BefriendRequest.findOne({ from, to, state });
};

const getUserRequests = async (to: string, state: any) => {
  return BefriendRequest.find({ to, state });
};

export default {
  getFriends,
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
