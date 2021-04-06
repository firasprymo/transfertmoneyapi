
const catchAsync = require("../utils/catchAsync");
const message = require('../models/messageModel');
const conversation = require('../models/conversationModel')

// start new Chat
exports.startChat = catchAsync(async (req, res, next) => {
  if(!req.params.recipient) {
    return next(new AppError("le recipient n'existe pas", 400));
  }
  const data = new conversation({
    participants: [req.user.id, req.params.recipient]
  });

  data.save(function (err, newConversation) {
    if (err) {
      res.send({ message: "Vous ne pouvez pas faire une conversation " });
      return next(err);
    }
    res.status(200).json({ message: 'Conversation started!', conversationId: newConversation._id });
    return next();
  });
});


//chat entre le users et ladmin
exports.sendMessage = catchAsync(async (req, res, next) => {
  if (!req.body.message) {
    return next(new AppError("il faut saisir un message", 400));
  }
  const data = new message({
    conversationId: req.params.conversationId,
    message: req.body.message,
    sender: req.user.id
  });

  data.save(function (err, sentReply) {
    if (err) {
      res.send({message: 'message non envoyer ' });
      return next(err);
    }

    res.status(200).json({ message: 'message envoyer avec succés', data: req.body.message });
    return (next);
  });

});


//get list of messages in chat
exports.getListMessages = catchAsync(async (req, res, next) => {
  if (!req.params.conversationId) {
    return next(new AppError("il faut envoyer l'id de conversation", 400));

  }
  
  message.find({ conversationId: req.params.conversationId })
    .select('createdAt message sender')
    .sort('-createdAt')
    .populate({
      path: 'sender',
      select: 'name role'
    })
    .exec(function (err, messages) {
      if (err) {
        res.send({ message: "message non envoyé" });
        return next(err);
      }

      res.status(200).json({ conversation: messages });
    });
});

//modifer le status de message
exports.changeStatusMessage = catchAsync(async (req, res, next) => {
  await message.findByIdAndUpdate(req.params.idMessage, {
    status: true,
  });
  res.status(200).json({
    message: 'Message Lu',

  });

})