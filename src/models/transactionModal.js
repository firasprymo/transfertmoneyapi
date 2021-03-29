const mongoose = require('mongoose');
const validator = require('validator');

const transactionSchema = new mongoose.Schema({
  amount: {
    type: String,
    require: [true, 'merci de saisir  le montent .']
  },
  currency: {
    type: String,
    require: [true, 'merci de saisir votre currency']
  },
  externalId: {
    type: Number,
    require: [true, 'merci de saisir votre telephone'],
    unique: true,
    maxlength: 8,
    minlength: 8,
    validate: {
      validator: function(el) {
        return el.toString().length === 8;
      },
      message: 'le numéro doit etre 8 caractères'
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
      unique: true,
      maxlength: 8,
      minlength: 8,
      validate: {
        validator: function(el) {
          return el.toString().length === 8;
        },
        message: 'le numéro doit etre 8 caractères'
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
    required: [true, 'Review must belong to a user']
  }
});
transactionSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name '
  });
  next();
});
const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
