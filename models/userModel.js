const crypto = require('crypto');

const mongoose = require('mongoose');

const validator = require('validator');

const bcrypt = require('bcryptjs');

//  name email photo password confirm password
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your Name '],
  },
  email: {
    type: String,
    unique: true,
    required: [true, ' Please provide us your email address '],
    lowerCase: true,
    validate: [validator.isEmail, 'please provide a valid email address'],
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'please provide a password'],
    minLength: 8,
    trim: true,
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, 'Please confirm your password'],
    trim: true,
    validate: {
      validator: function (value) {
        return value === this.password;
      },
      message: 'Passwords are not the same',
    },
  },
  passwordChangedAt: {
    type: Date,
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type:  Boolean,
    default: false,
  }
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();


  this.passwordChangedAt = Date.now() - 1000;


  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.confirmPassword = undefined;

  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  const state = await bcrypt.compare(candidatePassword, userPassword);
  return state;
};

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return JWTTimeStamp < changedTimeStamp;
  }
  return false;
};

// userSchema.methods.createPasswordResetToken = function () {
//   // we create the token by using randomBytes from crypto module
//   const resetToken = crypto.randomBytes(32).toString('hex');

//   // we hashed the token we  created and store it in the field in the db for this user

//   this.passwordResetToken = crypto
//     .createHash('sha256')
//     .update(resetToken)
//     .digest('hex');

//   // we specifiy the expire time for the token
//   this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // to convert the min to milliseconds 60 * 1000


//   return resetToken;
// };


userSchema.methods.createResetPasswordToken = function (){

  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  this.passwordResetExpires = Date.now() + (10 * 60 * 1000);

  return resetToken;
  

}

userSchema.pre(/^find/, function (next){
  
  this.find({active: {$ne: false}});

  next();
})
const User = mongoose.model('User', userSchema);

module.exports = User;
