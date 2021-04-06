const express = require('express');
const botController = require('../controllers/botController');
const authController = require('../controllers/authController');

const router = express.Router();
router.use(authController.protect);
router.post('/SendMessage',botController.SendMessage);
router.patch('/luMessage', botController.activeMessage);
router.get('/listeMessageByUser',botController.getMessageByUserId)

module.exports = router;


