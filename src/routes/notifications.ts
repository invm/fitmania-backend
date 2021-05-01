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
  '/list',
  NotificationsValidator.getNotifications,
  Responder(NotificationsController.getNotifications)
);

router.get(
  '/single/:id',
  NotificationsValidator.getSingleNotification,
  Responder(NotificationsController.getSingleNotification)
);

router.post(
  '/read/:id',
  NotificationsValidator.markAsRead,
  Responder(NotificationsController.markAsRead)
);

router.delete(
  '/delete/:id',
  NotificationsValidator.deleteNotification,
  Responder(NotificationsController.deleteNotification)
);

module.exports = router;
