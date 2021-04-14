const factory = require('./handlerFactory');
const APIFeatures = require('./../utils/apiFeatures');
const Notification = require('../models/notificationModel');
const catchAsync = require('../utils/catchAsync');
const axios = require('axios');


//send notification
exports.SendNotification = catchAsync(async (req, res, next) => {
  req.body.app_id = process.env.NOTIFICATION_APP_ID
  req.body.include_player_ids = [req.user.idDevice]
  var options = {
    method: 'POST',
    url: 'https://onesignal.com/api/v1/notifications',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${process.env.NOTIFICATION_TOKEN}`
    },
    data: req.body
  };
  var sendNotification = await axios.request(options);
  if (!sendNotification) {
    return next(new AppError("il ya un erreur lors de l'envoie de notification", 400));
  }
  req.body.userID = req.user.id;
  await Notification.create(req.body);
  res.status(200).send({
    message: 'notification send'
  });
});

exports.getAllNotifications = factory.getAll(Notification);
exports.getNotification = factory.getOne(Notification, { path: 'reviews' });
exports.createNotification = factory.createOne(Notification);
exports.deleteNotification = factory.deleteOne(Notification);

exports.getUserNotification = catchAsync(async (req, res, next) => {
 
  if (req.user.id) filter = { userID: req.user.id };
  const features = new APIFeatures(Notification.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const doc = await features.query;
  const numberNotificationNoLu = doc.filter(element => element.status === false)
  if (!doc) {
    return next(new AppError('No notification found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: doc,
      NombresNotifications:numberNotificationNoLu.length
    },
    
  });
});


exports.activeMessage = catchAsync(async (req, res) => {
  await Message.findByIdAndUpdate(req.body.id, {
    status: true,
  });
  res.status(200).json({
    message: 'Message Lu',

  });
});

exports.activeNotification = catchAsync(async (req, res) => {
  await Notification.findByIdAndUpdate(req.body.id, {
    status: true,
  });
  res.status(200).json({
    message: 'Notification Lu',

  });
});


