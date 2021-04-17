export {};
const express = require('express');
const {
	getNotifications,
	getSingleNotification,
	markAsRead,
	deleteNotification,
	getNotificationsCount,
} = require('../controllers/notifications');
const { validateReq, isAuthenticated } = require('../middleware/validators');
const router = express.Router();

const validate = [isAuthenticated, validateReq];

router.get('/count', ...validate, getNotificationsCount);
router.get('/list', ...validate, getNotifications);
router.get('/single/:id', ...validate, getSingleNotification);
router.post('/read/:id', ...validate, markAsRead);
router.delete('/delete/:id', ...validate, deleteNotification);

module.exports = router;
