import { check } from 'express-validator';
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
      .withMessage(Errors.A0)
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
      })
      .withMessage(Errors.A2), // A user with this email does not exist
    check('otp').optional(),
  ],
};
