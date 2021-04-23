import User from '../models/User';
import { IObject } from '../types/IObject';

const exists = async (_id: string, filters: IObject) => {
  let result = await User.findOne({ _id, ...filters }).lean();
  return !!result;
};

const getUser = async ({
  filter,
  select = '-__v -updated_at',
  populate,
}: {
  filter: { [key: string]: any };
  select?: { [key: string]: any } | string;
  populate?: { [key: string]: any } | string;
}) => {
  let query = User.findOne(filter).select(select).lean();

  if (populate) query.populate(populate);

  return query.lean();
};

const getUsers = async ({
  offset = 0,
  limit = 10,
  filter = {},
  select,
  populate,
  skipPagination,
}: {
  offset?: number;
  limit?: number;
  filter: { [key: string]: any };
  select?: { [key: string]: any } | string;
  populate?: { [key: string]: any } | string;
  skipPagination?: boolean;
}) => {
  let query = User.find(filter);

  if (select) query.select(select);

  if (populate) query.populate(populate);

  if (!skipPagination) query.skip(offset * limit).limit(limit);

  return query;
};

const updateUser = async ({
  filter,
  params,
}: {
  filter: { [key: string]: any };
  params: { [key: string]: any };
}) => {
  return await User.updateOne(filter, { $set: params });
};

const createUser = async ({
  email,
  name,
  lastname,
}: {
  email: string;
  name: string;
  lastname: string;
}) => {
  return await User.create({
    name,
    email,
    lastname,
  });
};

export default { exists, getUser, getUsers, updateUser, createUser };
