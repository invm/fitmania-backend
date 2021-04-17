import { Document } from 'mongoose';
import BefriendRequest, { IBefriendRequest } from '../models/BefriendRequest';
import UserDBService from './User';

/**
 *
 * @param _id users ObjectId
 * @returns array of users populated with minimal info
 */
const getFriends = async (_id: string) => {
  let friendsIds = (
    await BefriendRequest.find({
      $and: [{ $or: [{ from: _id }, { to: _id }] }, { state: 'accepted' }],
    })
  ).map((v: IBefriendRequest) =>
    v.from === _id ? v.to.toString() : v.from.toString()
  );

  return friendsIds;
};

export default { getFriends };
