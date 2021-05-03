import UsersDBService from '../services/Users';
import { Request } from 'express';
import compress from '../utils/compress';

const getUser = async (req: Request) => {
  let data = await UsersDBService.getUser({ filter: { _id: req.params.id } });
  return { data };
};

const updateUser = async (req: Request) => {
  const updateFields: any = {
    ...req.body,
  };

  if (req.file) {
    updateFields.avatar = await compress(req.user._id, req.file);
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
};
