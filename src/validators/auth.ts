import { check } from 'express-validator';
import { Request } from 'express';
import UserDBService from '../services/User';
import Errors from '../config/Errors';

export = {
  register: [
    check('name').exists().withMessage(Errors.A3).bail(),
    check('lastname').exists().withMessage(Errors.A4).bail(),
    check('email')
      .exists()
      .normalizeEmail()
      .isEmail()
      .withMessage(Errors.A11)
      .custom(async (email: string) => {
        let user = await UserDBService.getUser({ filter: { email } });
        if (user) {
          throw new Error(Errors.A1);
        }
      })
      .withMessage(Errors.A1)
      .bail(), // Email is taken by another user
  ],

  login: [
    check('email')
      .exists()
      .withMessage(Errors.A3)
      .custom(async (email: string) => {
        let user = await UserDBService.getUser({ filter: { email } });
        if (!user) {
          throw new Error();
        }
        return true;
      })
      .withMessage(Errors.A2),
    check('otp').optional(),
  ],

  getUser: [
    check('')
      .custom(async (_, { req }) => {
        let user = await UserDBService.getUser({ filter: { _id: req.params.id } });
        if (!user) {
          throw new Error();
        }
        return true;
      })
      .withMessage(Errors.A9),
  ],
};
