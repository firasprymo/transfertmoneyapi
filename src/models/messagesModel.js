const mongoose = require('mongoose');
const messageSchema = new mongoose.Schema({

  message: {
      type:String,
      require:true
  },

  senderType:{
    type:String,
    required:true
  },
  senderID:{
    type:String,
    required:true
  },
  status: {
    type:String,
    required:true,
    default:false
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },

});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
