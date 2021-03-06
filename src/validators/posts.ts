import { IEvent } from './../models/Event';
import { check } from 'express-validator';
import Errors from '../config/Errors';
import { entityExists, paginationQuery, postOwner, checkIfLiked, checkIfShared } from './index';
import ENTITIES, { displayEnum, paceEnum, sportEnum } from '../models';

export = {
  getUsersPosts: paginationQuery,

  getPosts: [
    ...paginationQuery,
    check('userId').optional().isMongoId().withMessage(Errors.A0).bail(),
    check('sports').optional().isArray().withMessage(Errors.A0).bail(),
    check('sports.*')
      .isString()
      .withMessage(Errors.A0)
      .bail()
      .custom((val) => {
        if (!sportEnum.includes(val)) throw new Error();
        return true;
      })
      .withMessage(Errors.A0),
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
    check('text').exists().withMessage(Errors.A15).isLength({ max: 280 }).bail().isString().withMessage(Errors.A0),
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
    check('startDate')
      .optional()
      .toInt()
      .isInt({ min: new Date().valueOf() + 60000 * 60 * 15 })
      .bail(),
    check('limitParticipants').optional().toInt().isInt({ min: 2, max: 100 }).bail(),
    check('openEvent').optional().toBoolean().isBoolean().bail(),
    check('eventType')
      .optional()
      .isString()
      .withMessage(Errors.A0)
      .bail()
      .custom((val) => sportEnum.includes(val))
      .withMessage(Errors.A0)
      .bail(),
    check('address').optional().isString().withMessage(Errors.A0).bail(),
    check('coordinates').optional().isArray({ min: 2, max: 2 }).withMessage(Errors.A0).bail(),
    check('coordinates.*').optional().toFloat().isFloat({ min: 0, max: 180 }).withMessage(Errors.A0).bail(),
    check('pace')
      .optional()
      .isString()
      .withMessage(Errors.A0)
      .bail()
      .custom((val) => paceEnum.includes(val))
      .withMessage(Errors.A0)
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
