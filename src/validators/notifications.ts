import { check } from 'express-validator';
import { entityExists, paginationQuery } from '.';
import Errors from '../config/Errors';
import ENTITIES, { sportEnum } from '../models';
import NotificationsDBService from '../services/Notifications';

export = {
  getNotifications: [...paginationQuery],
  getSingleNotification: [
    entityExists(ENTITIES.notification, { required: true }),
    check('id')
      .custom(async (val, { req }) => {
        let notification = await NotificationsDBService.getNotification({ _id: val });
        if (notification.to.toString() !== req.user._id.toString()) {
          throw new Error();
        }
        return true;
      })
      .withMessage(Errors.A44)
      .bail(),
  ],
  markAsRead: [
    entityExists(ENTITIES.notification, { required: true }),
    check('id')
      .custom(async (val, { req }) => {
        let notification = await NotificationsDBService.getNotification({ _id: val });
        if (notification.to.toString() !== req.user._id.toString()) {
          throw new Error();
        }
        return true;
      })
      .withMessage(Errors.A44)
      .bail(),
  ],
  deleteNotification: [
    entityExists(ENTITIES.notification, { required: true }),
    check('id')
      .custom(async (val, { req }) => {
        let notification = await NotificationsDBService.getNotification({ _id: val });
        if (notification.to.toString() !== req.user._id.toString()) {
          throw new Error();
        }
        return true;
      })
      .withMessage(Errors.A44)
      .bail(),
  ],
};
