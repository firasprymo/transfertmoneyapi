const AppError = require('../utils/appError');
var axios = require('axios')
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const APIFeatures = require('./../utils/apiFeatures');
const factoryTransaction = require('./handlerTransaction')
const Transaction = require('../models/transactionModal');

exports.ConsulterSolde = catchAsync(async (req, res, next) => {
  var options = {
    method: 'GET',
    url: process.env.URL_MOMO_UUID_REFERENCE_ID
  };

  const X_Reference_id = await axios.request(options);

  await factoryTransaction.Generate_Api_User(X_Reference_id, next);
  await factoryTransaction.GetApiKey(X_Reference_id, req, res, next);
});
//generate api user
exports.transferArgent = catchAsync(async (req, res, next) => {
  var options = {
    method: 'GET',
    url: process.env.URL_MOMO_UUID_REFERENCE_ID
  };

  const X_Reference_id = await axios.request(options);
  await factoryTransaction.Generate_Api_User(X_Reference_id, next);
  await factoryTransaction.CreatedUser(X_Reference_id, next);
  await factoryTransaction.GetAPITransfert(X_Reference_id, req, res, next);
});



exports.getAllTransactions = factory.getAll(Transaction);
exports.getTransaction = factory.getOne(Transaction, { path: 'reviews' });
exports.createTransaction = factory.createOne(Transaction);
exports.updateTransaction = factory.updateOne(Transaction);
exports.deleteTransaction = factory.deleteOne(Transaction);

exports.getUserHistorique = catchAsync(async (req, res, next) => {

  if (req.user.id) filter = { users: req.user.id };

  const features = new APIFeatures(Transaction.find(filter), req.query)
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


// exports.trensfertUbPay = catchAsync(async(req,res,next) =>{
//   var options = {
//     method: 'post',
//     url:process.env.URL_UB_PAY,
//     headers: { 
//       'Content-Type': 'application/json'
//     },
//     data : req.body
//   };
//   var trensfert  = new Transaction ({
//     amount:req.body.amount,
//     currency:req.body.currency,
//     payerMessage:req.body.description,
//     users:req.user.id,
//     merchantRef:req.body.merchantRef

//   })
//   await trensfert.save()
//   var trensfert = await axios.request(options);
//   res.status(200).send({
//     data:trensfert.data
//   })
// })



exports.TransfertArgentManyOperateyr = catchAsync(async (req, res, next) => {
  if (!req.body) {
    return next(new AppError('Veuillez remplir votre formulaire!', 400));
  }
  var options = {
    method: 'post',
    url: process.env.URL_TRANSFERT,
    data: req.body
  }
  var data = await axios.request(options)
  if (!data) {
    return next(new AppError('Erreur lors de transfert', 400))
  }
  req.body.userId = req.user.id
  Transaction.create(req.body)
  res.status(201).send({
    data: data.data,
    message: 'Votre transfert fait avec succès'
  })

})