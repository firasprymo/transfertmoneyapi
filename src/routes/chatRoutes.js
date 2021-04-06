const express = require('express');
const chatController = require('../controllers/chatController')
const authController = require('../controllers/authController');

const router = express.Router();
router.use(authController.protect);
//creer conversation
router.get('/newCoversation/:recipient',chatController.startChat);
//chat netre les deux 
router.post('/sendMessage/:conversationId',chatController.sendMessage);
//get liste des message dans une conversation
router.get('/GetMessages/:conversationId',chatController.getListMessages);
//update status message
router.patch('/:idMessage', chatController.changeStatusMessage);


module.exports = router;


