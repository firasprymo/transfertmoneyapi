const catchAsync = require("../utils/catchAsync");
const dialogflow = require('dialogflow');
const Message = require('../models/messagesModel')


exports.SendMessage = catchAsync(async (req, res, next) => {
    // console.log(req.body)
    if (!req.body) {
        return next(new AppError("il faut saisir un message", 400));
    }
    console.log(req.user._id)
    const projectId = process.env.googleProjectID;
    const sessionId = process.env.dialogFlowSessionID;
    const sessionClient = new dialogflow.SessionsClient();
    const sessionPath = sessionClient.sessionPath(projectId, sessionId);
    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                // The query to send to the dialogflow agent
                text: req.body.message,
                // The language used by the client (en-US)
                languageCode: 'en-US',
            },
        },
    };
    const responses = await sessionClient.detectIntent(request);
    //  req.body.senderID = req.user.id;

    req.body.senderType = req.user.role
    req.body.senderID = req.user.id
    await Message.create(req.body)
    if (!responses) {
        return next(new AppError("IL ya un erreur lors de l'envois de message", 400));
    }
    const result = responses[0].queryResult;

    res.status(200).json({ response: result.fulfillmentText, status: 'success' })

})