import { IEvent } from './../models/Event';
import { check } from 'express-validator';
import Errors from '../config/Errors';
import { entityExists, paginationQuery, postOwner, checkIfLiked, checkIfShared } from './index';
import ENTITIES, { displayEnum } from '../models';

export = {
  getUsersPosts: paginationQuery,

  getPosts: [
    ...paginationQuery,
    check('isEvent').optional().isNumeric().withMessage(Errors.A0).bail(),
    check('sports').optional().isString().withMessage(Errors.A0).bail(),
  ],

  getPost: [entityExists(ENTITIES.post, { required: true })],

  deletePost: [
    entityExists(ENTITIES.post, { required: true }),
    check('id')
      .custom(async (value, { req }) => {
        // restricted to post owners
        if (!(await postOwner(value, req.user._id))) {
          throw new Error();
        }
        return true;
      })
      .withMessage(Errors.A14)
      .bail(),
  ],

  updatePost: [
    entityExists(ENTITIES.post, { required: true }),
    check('id')
      .custom(async (value, { req }) => {
        // restricted to post owners
        if (!(await postOwner(value, req.user._id))) {
          throw new Error();
        }
        return true;
      })
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
    check('group').optional().isString().withMessage(Errors.A0).bail(),
    check('event')
      .optional()
      .custom((obj: IEvent) => {
        if (
          !obj?.eventType ||
          !obj?.location?.coordinates?.length ||
          !obj.startDate ||
          obj.openEvent === undefined ||
          new Date(obj.startDate).getTime() < new Date().getTime() ||
          !obj.limitParticipants ||
          +obj.limitParticipants < 2 ||
          !obj.pace
        ) {
          throw new Error();
        }
        return true;
        return true;
      })
      .withMessage(Errors.A16)
      .bail(),
  ],

  likePost: [
    entityExists(ENTITIES.post, { required: true }),
    check('id')
      .custom(async (value, { req }) => {
        // do not allow if the user is author
        if (await postOwner(value, req.user._id)) {
          throw new Error();
        }
        return true;
      })
      .withMessage(Errors.A21)
      .bail()
      .custom(async (val, { req }) => {
        // do not allow if already liked
        if (await checkIfLiked(val, req.user._id)) {
          throw new Error();
        }
        return true;
      })
      .withMessage(Errors.A17)
      .bail(),
  ],

  dislikePost: [
    entityExists(ENTITIES.post, { required: true }),
    check('id')
      .custom(async (value, { req }) => {
        // do not allow if the user is author
        if (await postOwner(value, req.user._id)) {
          throw new Error();
        }
        return true;
      })
      .withMessage(Errors.A21)
      .bail()
      .custom(async (val, { req }) => {
        // do not allow if didn't like
        if (!(await checkIfLiked(val, req.user._id))) {
          throw new Error();
        }
        return true;
      })
      .withMessage(Errors.A18)
      .bail(),
  ],

  sharePost: [
    entityExists(ENTITIES.post, { required: true }),
    check('id')
      .custom(async (value, { req }) => {
        // do not allow if the user is author
        if (await postOwner(value, req.user._id)) {
          throw new Error();
        }
        return true;
      })
      .withMessage(Errors.A21)
      .bail()
      .custom(async (val, { req }) => {
        // do not allow if already shared
        if (await checkIfShared(val, req.user._id)) {
          throw new Error();
        }
        return true;
      })
      .withMessage(Errors.A19)
      .bail(),
  ],

  unsharePost: [
    entityExists(ENTITIES.post, { required: true }),
    check('id')
      .custom(async (value, { req }) => {
        // do not allow if the user is author
        if (await postOwner(value, req.user._id)) {
          throw new Error();
        }
        return true;
      })
      .withMessage(Errors.A21)
      .bail()
      .custom(async (val, { req }) => {
        // do not allow if didn't share
        if (!(await checkIfShared(val, req.user._id))) {
          throw new Error();
        }
        return true;
      })
      .withMessage(Errors.A19)
      .bail(),
  ],
};
