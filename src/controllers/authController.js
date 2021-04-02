const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');
const { token } = require('morgan');

const client = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

//send code with SMS phone
const SendSMS = catchAsync(async (user, req, res, next) => {
  const phoneNumber = user.phoneNumber;
  if (!phoneNumber) {
    return next(new AppError('Numéro de téléphone invalide!', 400));
  }
  const SMS = await client.verify
    .services(process.env.TWILIO_SERVICE_ID)
    .verifications.create({
      locale: 'fr',
      to: `+${phoneNumber}`,
      channel: 'sms'
    });
});

//verifer le code envoyer SMS
exports.VeriferCodeSMS = catchAsync(async (req, res, next) => {
  if (!req.body.phonenumber && !req.body.code) {
    return next(new AppError('Code de vérification invalide ou expiré!', 400));
  }
  const verifercode = await client.verify
    .services(process.env.TWILIO_SERVICE_ID)
    .verificationChecks.create({
      to: `+${req.body.phonenumber}`,
      code: req.body.code
    });
  const user = await User.findOneAndUpdate(
    { phoneNumber: req.body.phonenumber },
    { active: true }
  );

  // user.active = true;
  if (verifercode.status === 'approved') {
    res.status(200).send({
      message: 'User is Verified!!'
    });
  } else {
    res.status(400).send({
      message: 'User not Verified!!'
    });
  }
});

const createSendToken =async (user, statusCode, res) => {
  const token =await signToken(user._id);
  // Remove password from output
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  if (!req.body)
    return next(new AppError('Veuillez remplir votre formulaire!', 400));
  const newUser = await User.create(req.body);

  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, res);
  // SendSMS(newUser);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');
  if (!user.active) {
    return next(new AppError("Vous n'avez pas les droits d'accés!", 400));
  }

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) If everything ok, send token to client
 await createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } 

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);

      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email

  const SMSCode = await client.verify
    .services(process.env.TWILIO_SERVICE_ID)
    .verifications.create({
      locale: 'fr',
      to: `+${req.body.phonenumber}`,
      channel: 'sms'
    });

  const user = await User.findOne({ phoneNumber: req.body.phonenumber });
  if (!user) {
    return next(
      new AppError(
        "Il n'y a aucun utilisateur avec ce numéro de téléphone",
        404
      )
    );
  }

  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  try {
    // const resetURL = `${req.protocol}://${req.get(
    //   'host'
    // )}/api/v1/users/resetPassword/${resetToken}`;
    // await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  if (!req.body.token) {
    return next(new AppError("Le jeton n'est pas valide ou a expiré", 400));
  }

  //filter if user exist or no
  const user = await User.findOne({ phoneNumber: req.body.phonenumber });
  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError("Le jeton n'est pas valide ou a expiré", 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
});
//dans la reset de password and code Pin

exports.sendCodeVerification = catchAsync(async (req, res, next) => {
  if (!req.body) {
    return next(new AppError('Numéro de téléphone invalide!', 400));
  }
  const SMSCode = await client.verify
    .services(process.env.TWILIO_SERVICE_ID)
    .verifications.create({
      locale: 'fr',
      to: `+${req.body.phonenumber}`,
      channel: 'sms'
    });

  res.status(200).json({ status: 'success',message:'Votre code est bien envoyer' });
});

exports.resetCodePin = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  //filter if user exist or no
  // if (!req.body.token) {
  //   return next(new AppError("Le jeton n'est pas valide ou a expiré", 401));
  // }
  const user = await User.findOne({ phoneNumber: req.body.phonenumber }).select(
    '+password'
  );
  if (
    !user ||
    !(await user.correctPassword(req.body.password, user.password))
  ) {
    return next(new AppError('Password is invalid ', 401));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.password;
  user.codePin = req.body.codePin;
  await user.save();
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // User.findByIdAndUpdate will NOT work as intended!

  // 4) Log user in, send JWT
  createSendToken(user, 200, req, res);
});
//login with code pin
exports.loginCodePin = catchAsync(async (req, res, next) => {
  const { codePin } = req.body;

  // 1) Check if email and password exist
  if (!codePin) {
    return next(new AppError('Please provide  codePin!', 400));
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ codePin }).select('+password');
  if (!user || !(user.codePin === codePin)) {
    return next(new AppError('Incorrect codePin', 401));
  }
  if (!user.active) {
    return next(new AppError("Vous n'avez pas les droits d'accés!", 400));
  }
  // 3) If everything ok, send token to client
  createSendToken(user, 200, res);
});
