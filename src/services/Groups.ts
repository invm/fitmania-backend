import Group, { IGroup } from '../models/Group';
import Post from '../models/Post';
import { IObject } from '../types/IObject';

const exists = async (_id: string, filter: IObject) => {
  let result = await Group.findOne({ _id, ...filter }).lean();
  return !!result;
};

const getGroup = async (filter: IObject, options?: { populate?: boolean }) => {
  let query = Group.findOne(filter);

  if (options?.populate) {
    query.populate('admin users', 'name lastname avatar');
  }
  return query;
};

const getGroups = async ({
  filter,
  populate,
  offset,
  limit,
}: {
  filter: IObject;
  populate?: boolean;
  offset: number;
  limit: number;
}) => {
  let query = Group.find(filter)
    .skip(offset * limit)
    .limit(limit);

  if (populate) {
    query.populate('admin users', 'name lastname avatar');
  }
  return query;
};

const createGroup = async ({ title, sport, description, admin, users }: IGroup) => {
  let data = await Group.create({
    title,
    sport,
    description,
    admin,
    users,
  });

  data.populate('admin users', 'name lastname avatar').execPopulate();
  return data;
};

const updateGroup = async (_id: string, params: IObject) => {
  await Group.updateOne(
    { _id },
    {
      $set: params,
    }
  );

  let data = await getGroup({ _id }, { populate: true });
  return data;
};

const deleteGroup = async (_id: string) => {
  await Post.updateMany({ group: _id }, { $set: { group: null } });
  await Group.deleteOne({ _id });
};

const joinGroup = async (_id: string, userId: string) => {
  await Group.updateOne(
    { _id },
    {
      $push: { users: userId },
    }
  );

  let data = await getGroup({ _id });
  return data;
};

const leaveGroup = async (_id: string, userId: string) => {
  await Group.updateOne(
    { _id },
    {
      $pull: { users: userId },
    }
  );

  let data = await getGroup({ _id });
  return data;
};

export default {
  exists,
  getGroup,
  getGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  joinGroup,
  leaveGroup,
};
