import { check } from 'express-validator';
import Errors from '../config/Errors';
import { IObject } from '../types/IObject';
import ENTITIES from '../models';
import UserDBService from '../services/User';
import PostDBService from '../services/Posts';

const paginationQuery = [
  check('offset').exists().withMessage(Errors.A3).bail(),
  check('limit').exists().withMessage(Errors.A4).bail(),
];

const postOwner = async (postId: string, userId: string) => {
  return !!(await PostDBService.getPost({ _id: postId, author: userId }));
};

const checkIfLiked = async (_id: string, userId: string) => {
  return !(await PostDBService.checkIfLiked(_id, userId));
};

const checkIfShared = async (_id: string, userId: string) => {
  return !(await PostDBService.checkIfShared(_id, userId));
};

const entityExists = (
  entity: string,
  { filter, fieldName, required }: { filter?: IObject; fieldName?: string; required?: boolean }
) => {
  const validator = check(fieldName ? fieldName : 'id')
    .isString()
    .withMessage(Errors.A0)
    .bail()
    .isMongoId()
    .withMessage(Errors.A10)
    .bail() // ID must be a valid MongoDB ID
    .custom(async (val) => {
      let exists;
      switch (entity) {
        case ENTITIES.user:
          exists = await UserDBService.exists(val, filter);
          break;
        case ENTITIES.post:
          exists = await PostDBService.exists(val, filter);
          break;
        default:
          break;
      }

      if (!exists) {
        throw new Error();
      }
    })
    .withMessage(Errors.A12); // The ID must belong to an existing entity

  if (required) {
    validator.exists().withMessage(Errors.A13).bail(); // An ID is required to get details of an entity
  } else {
    validator.optional();
  }

  return validator;
};

export { paginationQuery, entityExists, postOwner, checkIfShared, checkIfLiked };
