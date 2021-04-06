const catchAsync = require("../utils/catchAsync");
const dialogflow = require('dialogflow');
const Bot = require('../models/botModel')


exports.SendMessage = catchAsync(async (req, res, next) => {
    if (!req.body) {
        return next(new AppError("il faut saisir un message", 400));
    }
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
    req.body.senderID = req.user.id
    await Bot.create(req.body)
    if (!responses) {
        return next(new AppError("IL ya un erreur lors de l'envois de message", 400));
    }
    const result = responses[0].queryResult;
    res.status(200).json({ response: result.fulfillmentText, status: 'success' })

})


exports.activeMessage = catchAsync(async (req, res) => {

    await Bot.findByIdAndUpdate(req.body.id, {
        status: true,
    });
    // console.log('user',user);
    res.status(200).json({
        message: 'Message Lu',

    });
});
exports.getMessageByUserId = catchAsync(async (req, res, next) => {
    const listeMessage = await Bot.find({ senderID: req.params.id })
    res.status(200).json({
        listeMessage
    })
})


