import BefriendRequest, { IBefriendRequest } from '../models/BefriendRequest';

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



export default { getFriends, areFriends };
