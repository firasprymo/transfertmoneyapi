const mongoose = require('mongoose');
const validator = require('validator');
const transactionSchema = new mongoose.Schema({
  amount: {
    type: String,
    require: [true, 'Merci de saisir  le montent .']
  },
  currency: {
    type: String,
    require: [true, 'Merci de saisir votre currency']
  },
  externalId: {
    type: Number,
    require: [true, 'Merci de saisir votre numéro de téléphone'],
    maxlength: 8,
    minlength: 8,
    validate: {
      validator: function(el) {
        return el.toString().length === 8;
      },
      message: 'Le numéro doit être plus que 8 caractères'
    }
  },
  payee: {
    partyIdType: {
      type: String,
      require: [true],
      default: 'MSISDN'
    },
    partyId: {
      type: Number,
      require: [true],
      maxlength: 8,
      minlength: 8,
      validate: {
        validator: function(el) {
          return el.toString().length === 8;
        },
        message: 'le numéro doit être 8 caractères'
      }
    }
  },
  payerMessage: {
    type: String,
    require: [true]
  },
  payeeNote: {
    type: String,
    require: [true]
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },

  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'La transaction doit appartenir à un utilisateur']
  }
  // user: {
  //   type: mongoose.Schema.ObjectId,
  //   ref: 'user',
  //   required: [true, 'trensaction must belong to a user']
  // }
});
// transactionSchema.pre(/^find/, function(next) {
//   this.populate({
//     path: 'User',
//     select: 'name'
//   });
//   next();
// });
const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
