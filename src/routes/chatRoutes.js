const express = require('express');
const chatController = require('../controllers/chatController')
const authController = require('../controllers/authController');
const botController = require('../controllers/botController');
const router = express.Router();

router.use(authController.protect);
router.post('/SendMessage',botController.SendMessage);
router.patch('/luMessage', botController.activeMessage);
router.get('/listeMessageByUser/:id',botController.getMessageByUserId)
//creer conversation
router.get('/newCoversation/:recipient',chatController.startChat);
//chat netre les deux 
router.post('/sendMessage/:conversationId',chatController.sendMessage);
//get liste des message dans une conversation
router.get('/GetMessages/:conversationId',chatController.getListMessages);
//update status message
router.patch('/:idMessage', chatController.changeStatusMessage);
//liste message by user 
router.get('/listesMessage',chatController.getUserMessages);


router
  .route('/:id')
  
  .patch(chatController.updateMessage)
  .delete(chatController.deleteMessage);

module.exports = router;


