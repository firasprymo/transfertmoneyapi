const multer = require('multer');
const sharp = require('sharp');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');
const Historique = require('../models/transactionModal')




exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};




//exports.getUser = factory.getOne(User);
exports.getAllHistorique = factory.getAll(Historique);

// Do NOT update passwords with this!
// exports.updateUser = factory.updateOne(User);
// exports.deleteUser = factory.deleteOne(User);
