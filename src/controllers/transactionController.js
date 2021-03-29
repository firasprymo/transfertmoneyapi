const AppError = require("../utils/appError")
var axios = require("axios").default;
const catchAsync = require('../utils/catchAsync');
const Trensaction = require('../models/trensationModal')
const client = require('twilio')(process.env.ACCOUNT_SID_TWILIO, process.env.AUTH_TOKEN_TWILIO)

//generate ressource id (UUID)
exports.GenerateUUID = catchAsync(async (req, res, next) => {
    var options = {
        method: 'GET',
        url: process.env.URL_MOMO_UUID_REFERENCE_ID,
    };

    const X_Reference_id = await axios.request(options)

    await Generate_Api_User(X_Reference_id, next)
    await CreatedUser(X_Reference_id, next)
    await GetApiKey(X_Reference_id, req, res, next)

})
//generate api user
const Generate_Api_User = async (X_Reference_id, next) => {
    var options = {
        method: 'POST',
        data: {
            providerCallbackHost: 'https://webhook.site/' + X_Reference_id.data
        },
        url: process.env.URL_MOMO_API_USER + 'apiuser',
        headers: {
            'X-Reference-Id': X_Reference_id.data,
            'Ocp-Apim-Subscription-Key': process.env.Ocp_Apim_Subscription_KEY_MOMO,
            'Content-Type': 'application/json'

        }
    }
    const Api_User = await axios.request(options)
    if (!Api_User) {
        return next(new AppError('Api user not created', 400))
    }

}
//created user 
const CreatedUser = async (X_Reference_id, next) => {
    var options = {
        method: 'GET',
        url: process.env.URL_MOMO_API_USER + 'apiuser' + '/' + X_Reference_id.data,
        headers: {
            'Ocp-Apim-Subscription-Key': process.env.Ocp_Apim_Subscription_KEY_MOMO
        }
    }
    const Create_User = await axios.request(options)
    if (!Create_User) {
        return next(new AppError('Reference id not found or closed in sandbox', 404))
    }

}
//get api key
const GetApiKey = async (X_Reference_id, req, res, next) => {
    var options = {
        method: 'POST',
        url: process.env.URL_MOMO_API_USER + 'apiuser' + '/' + X_Reference_id.data + '/apikey',
        headers: {
            'Ocp-Apim-Subscription-Key': process.env.Ocp_Apim_Subscription_KEY_MOMO
        }

    }
    const Api_Key = await axios.request(options)
    if (!Api_Key) {
        return next(new AppError('Reference id not found or closed in sandbox', 404))
    }

    // GetTokenApi(Api_Key)
    const username = X_Reference_id.data
    const password = Api_Key.data.apiKey
    if (!username || !password) {
        return next(new AppError('Username && Password not found', 404))
    }
    const token = Buffer.from(`${username}:${password}`, 'utf8').toString('base64')
    var options2 = {
        method: 'POST',
        url: process.env.URL_MOMO_CREATE_COLLECTION,

        headers: {
            'Ocp-Apim-Subscription-Key': process.env.Ocp_Apim_Subscription_KEY_MOMO,
            'Authorization': `Basic ${token}`

        },
    }
    const Token = await axios.request(options2)
    if (!Token) {
        return next(new AppError('You are not authorized', 401))
    }
    await trensferArgent(Token, X_Reference_id, req, res, next)
}


const trensferArgent = async (Token, X_Reference_id, req, res, next) => {
    var options = {
        method: 'POST',
        headers: {
            'X-Reference-Id': X_Reference_id.data,
            'X-Target-Environment': process.env.X_Targe_Environement_MOMO,
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': process.env.Disbursements_KEY_MOMO,
            'Authorization': `Bearer ${Token.data.access_token}`,
        },
        url: process.env.URL_MOMO_TRENSACTION,
        data: req.body
    }
    const trensfer = await axios.request(options)
    const result = await Trensaction.create(req.body)
    if (!trensfer) {
        return next(new AppError('You are not authorized', 401))
    }

    if (trensfer.status === 202) {
        res.send({ message: 'transfert effectué avec succès' });

    } else {
        res.send({ message: 'echec de transfert' });
    }

}


//send code with SMS phone 
// exports.SendSMS = ((req,res,next) => {
//     if (req.query.phonenumber) {
//         client
//             .verify
//             .services(process.env.SERVICE_ID_TWILIO)
//             .verifications
//             .create({
//                 to: `+${req.query.phonenumber}`,
//                 channel: req.query.channel === 'call' ? 'call' : 'sms'
//             })
//             .then(data => {
                
//                 res.status(200).send({
//                     message: "Verification is sent!!",
//                     phonenumber: req.query.phonenumber,
//                     data
//                 })
//             })
//     } else {
//         res.status(400).send({
//             message: "Wrong phone number :(",
//             phonenumber: req.query.phonenumber,
//             data
//         })
//     }

// })

//verification code envoyer par SMS
