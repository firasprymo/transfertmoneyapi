const mongoose = require('mongoose');
const validator = require('validator');
const transactionSchema = new mongoose.Schema({
  merchantId: {
    type: Number,
    required: true
  },
  paymentOptionId: {
    type: Number,
    enum: ['345', '342', '347'],
  },
  customerPhone:{
    type:Number,
    validate: {
      validator: function(el) {
        return el.toString().length > 10;
      },
      message: 'Votre numéro doit être supérieur a 11 caractères'
    }
  },
  currency:{
      type:String,
      required:true
  },
  amount:{
    type:String,
    required:true
  },
  merchantReference:{
    type:String,
    required:true,
    unique:true

  },
  status: {
    type: Boolean,
    required: true,
    default: false
  },
  createdAt: {
    type: Date,
    default: new Date()
  },

  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'La transaction doit appartenir à un utilisateur']
  }

});
transactionSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'User',
    select: 'name'
  });
  next();
});
const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
