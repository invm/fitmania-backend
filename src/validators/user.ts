import { check } from 'express-validator';
import UsersDBService from '../services/Users';
import Errors from '../config/Errors';
import { entityExists } from '.';
import ENTITIES from '../models';

export = {
  updateUser: [
    check('name').optional().isString().withMessage(Errors.A0).bail(),
    check('lastname').optional().isString().withMessage(Errors.A0).bail(),
    check('birthday').optional().isISO8601().withMessage(Errors.A0).bail(),
    check('location').optional().isString().withMessage(Errors.A0).bail(),
    check('image').optional(),
    check('preferable').optional().isString().withMessage(Errors.A0).bail(),
    check('undesirable').optional().isString().withMessage(Errors.A0).bail(),
    check('fcmToken').optional().isString().withMessage(Errors.A0).bail(),
  ],

  getUser: [entityExists(ENTITIES.user, { required: true })],
};
