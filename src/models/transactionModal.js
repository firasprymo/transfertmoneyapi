const mongoose = require('mongoose');
const validator = require('validator');
const transactionSchema = new mongoose.Schema({
  merchantId:{
     type:String,
    // required:true
  },
  merchantRef:{
    type:String,
    unique:true
  },
  amount: {
    type: String,
    required: [true, 'Merci de saisir  le montent .']
  },
  currency: {
    type: String,
    required: [true, 'Merci de saisir votre currency']
  },
  // externalId: {
  //   type: Number,
  //   require: [true, 'Merci de saisir votre numéro de téléphone'],
  //   maxlength: 8,
  //   minlength: 8,
  //   validate: {
  //     validator: function(el) {
  //       return el.toString().length === 8;
  //     },
  //     message: 'Le numéro doit être plus que 8 caractères'
  //   }
  // },
  // payee: {
  //   partyIdType: {
  //     type: String,
  //     require: [true],
  //     default: 'MSISDN'
  //   },
  //   partyId: {
  //     type: Number,
  //     require: [true],
  //     maxlength: 8,
  //     minlength: 8,
  //     validate: {
  //       validator: function(el) {
  //         return el.toString().length === 11;
  //       },
  //       message: 'le numéro doit être 8 caractères'
  //     }
  //   }
  // },
  payerMessage: {
    type: String,
    required: [true]
  },
  // payeeNote: {
  //   type: String,
  //   require: [true]
  // },
  status:{
    type:Boolean,
    required:true,
    default:false
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },

  users: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'La transaction doit appartenir à un utilisateur']
  }

});
transactionSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'User',
    select: 'name'
  });
  next();
});
const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
