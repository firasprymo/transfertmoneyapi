const mongoose = require('mongoose');
const messageSchema = new mongoose.Schema({

  message: {
      type:String,
      require:true
  },

  senderID:{
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'message doit appartenir à un utilisateur']
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

messageSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'User',
    select: 'name'
  });
  next();
});
const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
