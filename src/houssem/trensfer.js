var axios = require("axios").default;
const Config = require("./config")
const express = require("express")
const AppError = require("./utile/apperror")
const router = express.Router();
const Trensfer = require('./trensferModal')
router.post('/transfer', async (req, res, next) => {
    //generate ressource id (UUID)
    var options = {
        method: 'GET',
        url: Config.URL,
    };

    const X_Reference_id = await axios.request(options)
    console.log(X_Reference_id.status)
    if (!X_Reference_id) {
        return next(new AppError('Please provide email and password!', 400));
    }
    //generate api user
    var options1 = {
        method: 'POST',
        data: {
            providerCallbackHost: 'https://webhook.site/' + X_Reference_id.data
        },
        url: Config.URLMONY + 'apiuser',
        headers: {
            'X-Reference-Id': X_Reference_id.data,
            'Ocp-Apim-Subscription-Key': Config.Ocp_Apim_Subscription_KEY,
            'Content-Type': 'application/json'

        }
    }
    const Api_User = await axios.request(options1)
    console.log(Api_User.status)
    if (!Api_User) {
        return next(new AppError('Api user not created', 400))
    }
    //get created user
    var options3 = {
        method: 'GET',
        url: Config.URLMONY + 'apiuser' + '/' + X_Reference_id.data,
        headers: {
            'Ocp-Apim-Subscription-Key': Config.Ocp_Apim_Subscription_KEY
        }
    }
    const Create_User = await axios.request(options3)
    console.log(Create_User.status)
    if (!Create_User) {
        return next(new AppError('Reference id not found or closed in sandbox', 404))
    }
    //get api key
    var options4 = {
        method: 'POST',
        url: Config.URLMONY + 'apiuser' + '/' + X_Reference_id.data + '/apikey',
        headers: {
            'Ocp-Apim-Subscription-Key': Config.Ocp_Apim_Subscription_KEY
        }

    }
    const Api_Key = await axios.request(options4)
    console.log(Api_Key.status)
    if (!Api_Key) {
        return next(new AppError('Reference id not found or closed in sandbox', 404))
    }
    //generate api token
    const username = X_Reference_id.data
    const password = Api_Key.data.apiKey
    if (!username || !password) {
        return next(new AppError('Username && Password not found', 404))
    }
    const token = Buffer.from(`${username}:${password}`, 'utf8').toString('base64')
    var options5 = {
        method: 'POST',
        url: Config.URLCOLLECTION,

        headers: {
            'Ocp-Apim-Subscription-Key': Config.Ocp_Apim_Subscription_KEY,
            'Authorization': `Basic ${token}`

        },
    }
    const Token = await axios.request(options5)
    console.log(Token.status)
    if (!Token) {
        return next(new AppError('You are not authorized', 401))
    }
    res.send(Token.data)
    //trensfer mony 
    console.log(Token.status)
   // var TOKEN = await JSON.parse(Token.data.access_token)
    var options6 = {
        method:'POST',
        headers: {
            'X-Reference-Id':X_Reference_id.data, 
            'X-Target-Environment':Config.X_Targe_Environement,
            'Content-Type':'application/json',
            'Ocp-Apim-Subscription-Key': Config.Ocp_Apim_Subscription_KEY2,
            'Authorization': `Bearer ${Token.data.access_token}`, 
           
        },
        url:Config.URLTRANSFER,
        data : req.body
    }
    
    const trensfer = await axios.request(options6)
    console.log(trensfer.status,"dddd")
 
  
    
    
    //res.send(body)


})


module.exports = router
