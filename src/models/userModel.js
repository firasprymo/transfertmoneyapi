const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'merci de saisir votre nom']
  },
  email: {
    type: String,
    required: [true, 'merci de saisir votre email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'merci de saisir un email correcte']
  },
  photo: {
    type: String,
    default: 'default.jpg'
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'merci de saisir votre mots de passe'],
    minlength: 8,
    select: false
    // validate: [validator.is, 'Please provide a valid email']
  },
  codePin: {
    required: [true, 'merci de saisir votre code pin'],
    type: Number,
    minlength: 4,
    maxlength: 4,
    validate: {
      validator: function(el) {
        return el.toString().length === 4;
      },
      message: 'Votre numéro doit être égal a 4 caractères'
    }
  },
  phoneNumber: {
    type: Number,
    unique:true,
    required: [true, 'Veuillez saisir votre numero telephone'],
    minlength: 8,
    // unique: false,
    validate: {
      validator: function(el) {
        return el.toString().length > 8;
      },
      message: 'votre numero doit etre au minimum 10 characters'
    }
  },
  idDevice :{
    type:String,
    required:true
  },

  passwordConfirm: {
    type: String,
    required: [true, 'merci de confirmer votre  mot de passe '],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function(el) {
        return el === this.password;
      },
      message: 'les mots de passe ne sont pas les mêmes!'
    }
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: false
  }
});

userSchema.pre('save', async function(next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// userSchema.pre(/^find/, function(next) {
//   // this points to the current query
//   this.find({ active: { $ne: false } });
//   next();
// });

userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(8).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
