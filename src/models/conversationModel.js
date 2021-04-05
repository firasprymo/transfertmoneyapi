const mongoose = require('mongoose');
const conversationSchema = new mongoose.Schema({
  participantID:{
      type:Array
  },
 listeMessage:{
     type:Array,
     message:{
         type:String
     },
     typeParticipant:{
         type:String
     },
     idParticipant:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'conversation doit appartenir à un utilisateur']
     }
 },
   createdAt: {
        type: Date,
        default: Date.now()
    },

});
conversationSchema.pre(/^find/, function(next) {
    this.populate({
      path: 'User',
      select: 'name'
    });
    next();
  });

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
