import { check } from 'express-validator';
import UserDBService from '../services/User';
import PostDBService from '../services/Posts';
import Errors from '../config/Errors';
import { entityExists, paginationQuery } from '.';
import ENTITIES from '../models';

export = {
  getPosts: [
    check('offset').exists().withMessage(Errors.A3).bail(),
    check('limit').exists().withMessage(Errors.A4).bail(),
    check('isEvent').optional(),
  ],
  getPost: [
    entityExists(ENTITIES.post, {}),
    // check('id')
    //   .isMongoId()
    //   .bail()
    //   .withMessage(Errors.A10)
    //   .custom(async (value) => {
    //     let post = await PostDBService.getPost({ _id: value, select: '_id' });
    //     if (!post) {
    //       throw new Error();
    //     }
    //   })
    //   .withMessage(Errors.A9),
  ],
  getUsersPosts: paginationQuery,
};
