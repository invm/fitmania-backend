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
  filter: IObject;
  select?: IObject | string;
  populate?: IObject | string;
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
  filter: IObject;
  select?: IObject | string;
  populate?: IObject | string;
  skipPagination?: boolean;
}) => {
  let query = User.find(filter);

  if (select) query.select(select);

  if (populate) query.populate(populate);

  if (!skipPagination) query.skip(offset * limit).limit(limit);

  return query;
};

const updateUser = async ({ filter, params }: { filter: IObject; params: IObject }) => {
  return User.updateOne(filter, { $set: params });
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
  return User.create({
    name,
    email,
    lastname,
  });
};

const count = async (filter: IObject) => {
  return User.countDocuments(filter);
};

export default { exists, getUser, getUsers, updateUser, createUser, count };
