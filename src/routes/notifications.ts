import express from 'express';
import Responder from '../utils/Responder';
import NotificationsController from '../controllers/notifications';
import NotificationsValidator from '../validators/notifications';
const router = express.Router();

router.get(
  '/count',
  Responder(NotificationsController.getNotificationsCount)
);

router.get(
  '/',
  NotificationsValidator.getNotifications,
  Responder(NotificationsController.getNotifications)
);

router.delete(
  '/:id',
  NotificationsValidator.deleteNotification,
  Responder(NotificationsController.deleteNotification)
);

module.exports = router;
