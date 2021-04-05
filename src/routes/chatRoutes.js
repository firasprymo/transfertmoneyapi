const express = require('express');
const chatController = require('../controllers/chatController');
const authController = require('../controllers/authController');

const router = express.Router();
router.use(authController.protect);
router.post('/sendMessage',chatController.chat);


module.exports = router;


