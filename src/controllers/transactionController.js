const AppError = require('../utils/appError');
var axios = require('axios').default;
const catchAsync = require('../utils/catchAsync');
const Transaction = require('../models/transactionModal');
const factory = require('./handlerFactory');
const APIFeatures = require('./../utils/apiFeatures');
// 1/ 
//generate ressource id (UUID)
const Generate_Api_User = async (X_Reference_id, next) => {
  var options = {
    method: 'POST',
    data: {
      providerCallbackHost: 'https://webhook.site/' + X_Reference_id.data
    },
    url: process.env.URL_MOMO_API_USER + 'apiuser',
    headers: {
      'X-Reference-Id': X_Reference_id.data,
      'Ocp-Apim-Subscription-Key': process.env.MOMO_Ocp_Apim_Subscription_KEY,
      'Content-Type': 'application/json'
    }
  };
  const Api_User = await axios.request(options);
  if (!Api_User) {
    return next(new AppError('Api user not created', 400));
  }
};
exports.ConsulterSolde = catchAsync(async (req, res, next) => {
  var options = {
    method: 'GET',
    url: process.env.URL_MOMO_UUID_REFERENCE_ID
  };

  const X_Reference_id = await axios.request(options);
  await Generate_Api_User(X_Reference_id, next);
  // if()
  // await CreatedUser(X_Reference_id, next);
  await GetApiKey(X_Reference_id, req, res, next);
});
//generate api user

//created user
const CreatedUser = async (X_Reference_id, next) => {
  var options = {
    method: 'GET',
    url: process.env.URL_MOMO_API_USER + 'apiuser' + '/' + X_Reference_id.data,
    headers: {
      'Ocp-Apim-Subscription-Key': process.env.MOMO_Ocp_Apim_Subscription_KEY
    }
  };
  const Create_User = await axios.request(options);
  if (!Create_User) {
    return next(
      new AppError('Reference id not found or closed in sandbox', 404)
    );
  }
};
//get api key
const GetApiKey = async (X_Reference_id, req, res, next) => {
  var options = {
    method: 'POST',
    url:
      process.env.URL_MOMO_API_USER +
      'apiuser' +
      '/' +
      X_Reference_id.data +
      '/apikey',
    headers: {
      'Ocp-Apim-Subscription-Key': process.env.MOMO_Ocp_Apim_Subscription_KEY
    }
  };
  const Api_Key = await axios.request(options);
  if (!Api_Key) {
    return next(
      new AppError('Reference id not found or closed in sandbox', 404)
    );
  }

  // GetTokenApi(Api_Key)
  const username = X_Reference_id.data;
  const password = Api_Key.data.apiKey;
  if (!username || !password) {
    return next(new AppError('Username && Password not found', 404));
  }
  const token = Buffer.from(`${username}:${password}`, 'utf8').toString(
    'base64'
  );

  var options2 = {
    method: 'POST',
    url: process.env.URL_MOMO_CREATE_COLLECTION,

    headers: {
      'Ocp-Apim-Subscription-Key': process.env.MOMO_Ocp_Apim_Subscription_KEY,
      Authorization: `Basic ${token}`
    }
  };
  const Token = await axios.request(options2);
  // return Token
  if (!Token) {
    return next(new AppError('You are not authorized', 401));
  }
  // console.log(req.query.id)
  //if(req.query.id == 1){
  await Solde(Token, req, res, next);
  //   console.log('ok')
  // }
  //else if(req.query.id == 2) {
  //await transferArgent(Token,X_Reference_id,req,res,next)
};
const GetAPITransfert = async (X_Reference_id, req, res, next) => {
  var options = {
    method: 'POST',
    url:
      process.env.URL_MOMO_API_USER +
      'apiuser' +
      '/' +
      X_Reference_id.data +
      '/apikey',
    headers: {
      'Ocp-Apim-Subscription-Key': process.env.MOMO_Ocp_Apim_Subscription_KEY
    }
  };
  const Api_Key = await axios.request(options);
  if (!Api_Key) {
    return next(
      new AppError('Reference id not found or closed in sandbox', 404)
    );
  }

  // GetTokenApi(Api_Key)
  const username = X_Reference_id.data;
  const password = Api_Key.data.apiKey;
  if (!username || !password) {
    return next(new AppError('Username && Password not found', 404));
  }
  const token = Buffer.from(`${username}:${password}`, 'utf8').toString(
    'base64'
  );

  var options2 = {
    method: 'POST',
    url: process.env.URL_MOMO_CREATE_COLLECTION,

    headers: {
      'Ocp-Apim-Subscription-Key': process.env.MOMO_Ocp_Apim_Subscription_KEY,
      Authorization: `Basic ${token}`
    }
  };
  const Token = await axios.request(options2);
  // return Token
  if (!Token) {
    return next(new AppError('You are not authorized', 401));
  }

  await transferArgent(Token, X_Reference_id, req, res, next);
};
exports.transferArgent = catchAsync(async (req, res, next) => {
  var options = {
    method: 'GET',
    url: process.env.URL_MOMO_UUID_REFERENCE_ID
  };

  const X_Reference_id = await axios.request(options);
  await Generate_Api_User(X_Reference_id, next);
  await CreatedUser(X_Reference_id, next);
  await GetAPITransfert(X_Reference_id, req, res, next);
});
const transferArgent = async (Token, X_Reference_id, req, res, next) => {
  const user = req.user.id;
  req.body.users = req.user.id;
  console.log(req.body);
  var options = {
    method: 'POST',
    headers: {
      'X-Reference-Id': X_Reference_id.data,
      'X-Target-Environment': process.env.MOMO_X_Targe_Environement,
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': process.env.MOMO_Disbursements_KEY,
      Authorization: `Bearer ${Token.data.access_token}`
    },
    url: process.env.URL_MOMO_TRENSACTION,

    data: req.body
  };
  const result = await Transaction.create(req.body);
  const transfer = await axios.request(options);
  if (!transfer) {
    return next(new AppError('You are not authorized', 401));
  }
  if (transfer.status === 202) {
    res.send({ message: 'transfert effectué avec succès' });
  } else {
    res.send({ message: 'echec de transfert' });
  }
};
const Solde = async (Token, req, res, next) => {
  var options = {
    method: 'GET',
    url:
      'https://sandbox.momodeveloper.mtn.com/collection/v1_0/account/balance',
    headers: {
      'X-Target-Environment': process.env.MOMO_X_Targe_Environement,
      'Ocp-Apim-Subscription-Key': process.env.MOMO_Ocp_Apim_Subscription_KEY,
      Authorization: `Bearer ${Token.data.access_token}`
    }
  };
  const solde = await axios.request(options);
  if (!solde) {
    return next(new AppError('You are not authorized', 401));
  }
  res.status(200).send({
    data: solde.data
  });
};

exports.SendNotification = catchAsync(async (req, res, next) => {
  var notification = {
    title: 'Title Notification',
    text: 'votre transaction fait avec succes'
  };
  var fcm_tokens = [];
  var notification_body = {
    notification: notification,
    registration_ids: fcm_tokens
  };
  var options = {
    methode: 'POST',
    url: process.env.NOTIFICATION_URL,
    headers: {
      Authorization: 'key=' + process.env.NOTIFICATION_TOKEN
    },
    data: JSON.stringify(notification_body),
    'Content-Type': 'application/json'
  };
  const Notification = axios.request(options);
  console.log(notification);
});

exports.getAllTransactions = factory.getAll(Transaction);
exports.getTransaction = factory.getOne(Transaction, { path: 'reviews' });
exports.createTransaction = factory.createOne(Transaction);
exports.updateTransaction = factory.updateOne(Transaction);
exports.deleteTransaction = factory.deleteOne(Transaction);

exports.getUserHistorique = catchAsync(async (req, res, next) => {
  console.log(req.user.id);
  if (req.user.id) filter = { users: req.user.id };
console.log(filter);
  const features = new APIFeatures(Transaction.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const doc = await features.query;

  // let query = Transaction.find({ user: '6065ad8e0a88c7de5dbc695e' });
  // query = query.populate({ path: 'user' });
  // const doc = await query;

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
