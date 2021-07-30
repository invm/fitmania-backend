import UsersDBService from '../services/Users';
import FriendsDBService from '../services/Friends';
import { Request } from 'express';
import compress from '../utils/compress';

const getUser = async (req: Request) => {
  let data = await UsersDBService.getUser({ filter: { _id: req.params.id }, select: '-__v -updated_at -fcmToken' });
  let friends = await FriendsDBService.getFriends(req.params.id);

  return { data: { ...data, friends } };
};

const getMyProfile = async (req: Request) => {
  let data = await UsersDBService.getUser({ filter: { _id: req.user.id }, select: '-__v -updated_at -fcmToken' });
  let friends = await FriendsDBService.getFriends(req.user._id);
  let befriendRequests = await FriendsDBService.getUserRequests(req.user._id, 'pending');
  return { data: { ...data, friends, befriendRequests } };
};

const updateUser = async (req: Request) => {
  const updateFields: any = {
    ...req.body,
  };

  if (req.file) {
    updateFields.image = await compress(req.user._id, req.file);
  }

  if (Object.keys(updateFields).length > 0) {
    await UsersDBService.updateUser({
      filter: { _id: req.user._id },
      params: updateFields,
    });
    let user = await UsersDBService.getUser({
      filter: { _id: req.user._id },
    });
    return { data: user };
  }
};

export default {
  getUser,
  updateUser,
  getMyProfile,
};
