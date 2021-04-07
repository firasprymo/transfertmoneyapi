const mongoose = require('mongoose');
const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status:{
          type:Boolean,
          default:false
    },
    
   createdAt: {
        type: Date,
        default: Date.now()
    },

});
messageSchema.pre(/^find/, function(next) {
    this.populate({
      path: 'User',
      select: 'name'
    });
    next();
  });
const message = mongoose.model('message', messageSchema);

module.exports = message;
