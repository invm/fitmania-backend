import { check } from 'express-validator';
import Errors from '../config/Errors';
import { entityExists } from '.';
import ENTITIES from '../models';
import { isArray } from 'lodash';
export = {
  updateUser: [
    check('name').isString().withMessage(Errors.A0).optional(),
    check('lastname').isString().withMessage(Errors.A0).optional(),
    check('birthday').isInt().toInt().withMessage(Errors.A0).optional(),
    check('location').isString().withMessage(Errors.A0).optional(),
    check('image').optional(),
    check('preferable').isArray().withMessage(Errors.A0).optional(),
    check('preferable.*').isString().withMessage(Errors.A0).optional(),
    check('undesirable').isArray().withMessage(Errors.A0).optional(),
    check('undesirable.*').isString().withMessage(Errors.A0).optional(),
    check('fcmToken').isString().withMessage(Errors.A0).optional(),
  ],

  getUser: [entityExists(ENTITIES.user, { required: true })],
};
