const mongoose = require('mongoose');
const conversationSchema = new mongoose.Schema({
  
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],

   createdAt: {
        type: Date,
        default: Date.now()
    },
});


const conversation = mongoose.model('conversation', conversationSchema);

module.exports = conversation;
