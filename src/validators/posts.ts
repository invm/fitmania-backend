import { IEvent } from './../models/Event';
import { check } from 'express-validator';
import Errors from '../config/Errors';
import { entityExists, paginationQuery, postOwner, checkIfLiked, checkIfShared } from './index';
import ENTITIES, { displayEnum } from '../models';

export = {
  getPosts: [
    check('offset').exists().withMessage(Errors.A3).bail(),
    check('limit').exists().withMessage(Errors.A4).bail(),
    check('isEvent').optional().isNumeric().withMessage(Errors.A0).bail(),
    check('sports').optional().isString().withMessage(Errors.A0).bail(),
  ],

  getPost: [entityExists(ENTITIES.post, {})],

  deletePost: [
    check('id')
      .custom((value, { req }) => postOwner(value, req.user._id))
      .withMessage(Errors.A14),
  ],

  updatePost: [
    check('id')
      .custom(async (value, { req }) => postOwner(value, req.user._id))
      .withMessage(Errors.A14)
      .bail(),
    check('text').exists().withMessage(Errors.A15).bail(),
  ],

  createPost: [
    check('text').exists().withMessage(Errors.A15).bail().isString().withMessage(Errors.A0),
    check('display')
      .exists()
      .withMessage(Errors.A0)
      .bail()
      .isString()
      .withMessage(Errors.A0)
      .bail()
      .custom((val) => displayEnum.includes(val))
      .withMessage(Errors.A0)
      .bail(),
    check('postImage').optional(),
    check('event')
      .optional()
      .custom((obj: IEvent) => {
        if (
          !obj?.eventType ||
          !obj?.location?.coordinates?.length ||
          !obj.startDate ||
          !obj.limitParticipants ||
          !obj.pace
        ) {
          return false;
        }
        return true;
      })
      .withMessage(Errors.A16)
      .bail(),
  ],

  likePost: [
    entityExists(ENTITIES.post, {}),
    check('id')
      .custom(async (val, { req }) => {
        return checkIfLiked(val, req.user._id);
      })
      .withMessage(Errors.A17)
      .bail(),
  ],

  dislikePost: [
    entityExists(ENTITIES.post, {}),
    check('id')
      .custom(async (val, { req }) => checkIfLiked(val, req.user._id))
      .withMessage(Errors.A18)
      .bail(),
  ],

  sharePost: [
    entityExists(ENTITIES.post, {}),
    check('id')
      .custom(async (val, { req }) => !checkIfShared(val, req.user._id))
      .withMessage(Errors.A19)
      .bail(),
  ],

  unsharePost: [
    entityExists(ENTITIES.post, {}),
    check('id')
      .custom(async (val, { req }) => checkIfShared(val, req.user._id))
      .withMessage(Errors.A19)
      .bail(),
  ],

  getUsersPosts: paginationQuery,
};
