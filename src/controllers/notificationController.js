const factory = require('./handlerFactory');
const APIFeatures = require('./../utils/apiFeatures');
const Notification = require('../models/notificationModel');
const catchAsync = require('../utils/catchAsync');



//send notification
exports.SendNotification = catchAsync(async (req, res, next) => {
    // const user = req.user.id;
    console.log(req.body);
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
  if (req.user.id) filter = { users: req.user.id };
  console.log(filter);
  const features = new APIFeatures(Notification.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const doc = await features.query;

  // let query = Transaction.find({ user: '6065ad8e0a88c7de5dbc695e' });
  // query = query.populate({ path: 'user' });
  // const doc = await query;

  if (!doc) {
    return next(new AppError('No notification found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    results: doc.length,
    data: {
      data: doc
    }
  });
});
