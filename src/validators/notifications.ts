import { check } from 'express-validator';
import { entityExists, paginationQuery } from '.';
import Errors from '../config/Errors';
import ENTITIES, { sportEnum } from '../models';
import NotificationsDBService from '../services/Notifications';

export = {
  getNotifications: [...paginationQuery],

  deleteNotification: [
    entityExists(ENTITIES.notification, { required: true }),
  ],
};
