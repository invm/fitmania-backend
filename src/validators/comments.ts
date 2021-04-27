import { check } from 'express-validator';
import Errors from '../config/Errors';
import { entityExists } from './index';
import ENTITIES from '../models';
import CommentsDBService from '../services/Comment';

export = {
  getComments: [entityExists(ENTITIES.post, {})],

  createComment: [
    entityExists(ENTITIES.post, {}),
    check('text')
      .exists()
      .withMessage(Errors.A0)
      .bail()
      .isString()
      .withMessage(Errors.A0)
      .bail()
      .isLength({ min: 1, max: 280 })
      .withMessage(Errors.A0)
      .bail(),
  ],

  updateComment: [
    entityExists(ENTITIES.post, {}),
    entityExists(ENTITIES.comment, { fieldName: 'commentId' }),
    check('commentId')
      .custom(async (val, { req }) => {
        let comment = await CommentsDBService.getComment(val);
        if (comment.user.toString() !== req.user._id.toString()) {
          throw new Error();
        }
      })
      .withMessage(Errors.A22),
    check('text')
      .exists()
      .withMessage(Errors.A0)
      .bail()
      .isString()
      .withMessage(Errors.A0)
      .bail()
      .isLength({ min: 1, max: 280 })
      .withMessage(Errors.A0)
      .bail(),
  ],

  deleteComment: [
    entityExists(ENTITIES.post, {}),
    entityExists(ENTITIES.comment, { fieldName: 'commentId' }),
    check('commentId')
      .custom(async (val, { req }) => {
        let comment = await CommentsDBService.getComment(val);
        if (comment.user.toString() !== req.user._id.toString()) {
          throw new Error();
        }
      })
      .withMessage(Errors.A22),
  ],
};
