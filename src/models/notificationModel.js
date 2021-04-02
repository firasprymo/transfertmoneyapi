const mongoose = require('mongoose');
const notificationSchema = new mongoose.Schema({
 contents: {
     en:{
        type: String,
        require:true
     }
    
  },
  headings: {
      en:{
    type: String,
    require:true
  }
  },
  include_player_ids:{
      type:Array,
      require:true
  },
  status: {
    type:Boolean,
    default:false
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
    userID: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'trensaction must belong to a user']
  }

});

notificationSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'User',
    select: 'name'
  });
  next();
});
const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
