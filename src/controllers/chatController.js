
const catchAsync = require("../utils/catchAsync");
const message = require('../models/messageModel');
const conversation = require('../models/conversationModel');
const factory = require('./handlerFactory');
const APIFeatures = require('./../utils/apiFeatures');
//Checks to see if conversation containing two users is in db
exports.findConcersation = catchAsync(async (req, res, next) => {
  conversation.findOne({ participants: { $all: [req.user._id, req.params.recipient] } })
    .populate({
      path: 'participants',
      select: 'name role email'
    })
    .exec(function (err, conversations) {
      if (conversations) {
        res.status(200).json({
          isPresent: true,
          message: "Found the conversation! ",
          conversationId: conversations._id, participants: conversations.participants
        });
      } else {
        res.status(200).json({
          isPresent: false,
          message: "CONVERSATION NOT FOUND ",
        });
      }
    });

});


// start new Chat
exports.startChat = catchAsync(async (req, res, next) => {
  if (!req.params.recipient) {
    return next(new AppError("le recipient n'existe pas", 400));
  }
  const data = new conversation({
    participants: [req.user.id, req.params.recipient]
  });
  data.save(function (err, newConversation) {
    if (err) {
      res.send({ message: "Vous ne pouvez pas faire une conversation " });
    }
    res.status(200).json({ message: 'Conversation started!', conversationId: newConversation._id });
  });
});


//chat entre le users et ladmin
// exports.sendMessage = catchAsync(async (req, res, next) => {
//   if (!req.body.message) {
//     return next(new AppError("il faut saisir un message", 400));
//   }

//   const data = new message({
//     conversationId: req.params.conversationId,
//     message: req.body.message,
//     sender: req.user.id
//   });
//        //if (socket) {
//          // socket.emit('order',data);
//        //}
//   data.save(function (err, sentReply) {
//     if (err) {
//       res.send({ message: 'message non envoyer ' });
//       return next(err);
//     }

//     res.status(200).json({ message: 'message envoyer avec succés', data: req.body.message });
//     return (next);
//   });

// });


//get list of messages in chat
exports.getListMessages = catchAsync(async (req, res, next) => {
  if (!req.params.conversationId) {
    return next(new AppError("il faut envoyer l'id de conversation", 400));
  }

  const listeMessage = await message.find({ conversationId: req.params.conversationId })
    .select('createdAt message sender')
    .sort('-createdAt')
    .populate({
      path: 'sender',
      select: 'name role photo'
    })

  res.status(200).json({ conversation: listeMessage })


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

exports.getMessage = factory.getOne(message, { path: 'reviews' });
exports.updateMessage = factory.updateOne(message);
exports.deleteMessage = factory.deleteOne(message);

//LISTE message by user
exports.getUserMessages = catchAsync(async (req, res, next) => {


  if (req.user.id) filter = { sender: req.user.id };

  const features = new APIFeatures(message.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const doc = await features.query;
  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    results: doc.length,
    data: {
      data: doc
    }
  });




});
