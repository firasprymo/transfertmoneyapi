const express = require('express');
const notificationController = require('../controllers/notificationController');
const authController = require('../controllers/authController');

const router = express.Router();
router.use(authController.protect);
router.post('/Sendnotification',notificationController.SendNotification);
router.get('/AllNotifications', notificationController.getAllNotifications);
router.get('/UserNotification', notificationController.getUserNotification);
router.patch('/notificationLu',notificationController.activeNotification)
module.exports = router;


