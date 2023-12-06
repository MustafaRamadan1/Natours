const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const crypto = require('crypto');
const User = require('../models/userModel');

const catchAsync = require('../utils/catchAsync');

const AppError = require('../utils/appError');

const sendEmail = require('../utils/email');

const signToken = (id) => {
  const token = jwt.sign({ id: id }, process.env.SECERT_KEY, {
    expiresIn: process.env.EXPIRE_TIME,
  });

  return token;
};

const createSendToken = (user, statusCode, res) =>{

  const cookieOption ={
    expires: new Date(Date.now() + process.env.JWT_COOKIES_EXPIRES_IN * 24 * 60 * 60 *  1000),
    httpOnly: true
  };
  const token = signToken(user._id);

  if (process.env.NODE_ENV === "Production") cookieOption.secure =  true;
  res.cookie('jwt', token,cookieOption )




  res.status(statusCode).json({
    status: 'success',
    token: token,
    data: {
      user
    }
  })
};
const signUp = catchAsync(async (req, res) => {
  const { name, email, password, confirmPassword, passwordChangedAt } =
    req.body;
  const user = await User.create({
    name: name,
    email: email,
    password: password,
    confirmPassword: confirmPassword,
    passwordChangedAt: passwordChangedAt,
  });
  if (!user) return new AppError("we can't create that user", 404);

  // create token for the user who register and create a user instance in db

  user.password = undefined;
  createSendToken(user, 201, res);
});

// const login = async (req, res, next) => {
//   const { email, password } = req.body;

//   //1-  check if email and password exists

//   if (!email || !password) {
//     return next(new AppError('please provide email and password', 400));
//   }
//   // 2- check if the email exist and password correct

//   const user = await User.findOne({ email: email }).select('+password');

//   console.log(user);
//   // if (!user) return next(new AppError('please provide a valid email', 404))

//   if (!user || !(await user.correctPassword(password, user.password))) {
//     return next(new AppError('Incorrect email or password', 401)); // 401 mean unAuthorized
//   }
//   // 3- if everything is ok , create token

//   createSendToken(user, 200, res);
  
// };



const login = catchAsync(async (req, res, next) => {
  
  const  {email, password} = req.body;

  if (!email || !password) return next(new AppError('please provide email and password', 400));

  const user  = await User.findOne({email}).select('+password');

  if (!user) return next(new AppError('Incorrect email or password', 401));

  const correct = await user.correctPassword(password, user.password);

  if (!correct) return next(new AppError('Incorrect email or password', 401));

  createSendToken(user, 200, res);

});
//  protect the route from unAuthorized access

const protect = catchAsync(async (req, res, next) => {
  let token;
  // 1) get the token from request and check if it exists

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } 
  else if (req.cookies.jwt){
    token = req.cookies.jwt
  }

  if (!token)
    return next(new AppError(' You are not logged in , please Login in ', 401));

  //2) validate the token

  const decode = await promisify(jwt.verify)(token, process.env.SECERT_KEY);

  //3) check if the user who use the token is still exist

  const freshUser = await User.findById(decode.id);

  if (!freshUser)
    return next(new AppError(`The user belonging to this token not exist `));

  //4) check if the user change the password after token was issued

  if (freshUser.changedPasswordAfter(decode.iat)) {
    return next(
      new AppError('User Recently changed Password ! please Login Again '),
    );
  }

  console.log("Hello here ");

  // here we pass the user data on the request so we can use it in the next

  req.user = freshUser;

  console.log(req.user);
  res.locals.user = freshUser;
  // here we call the next function to go to the next middleware on the middleware stack

  next();
});


const isLoggedIn = async (req, res , next)=>{

  // 1) get the token from request and check if it exists

   if (req.cookies.jwt){

    try{
      

  //2) validate the token

  const decode = await promisify(jwt.verify)(req.cookies.jwt, process.env.SECERT_KEY);
      console.log(decode);
  //3) check if the user who use the token is still exist

  const freshUser = await User.findById(decode.id);

  if (!freshUser) return next();

  //4) check if the user change the password after token was issued

  if (freshUser.changedPasswordAfter(decode.iat)) return next();

  // here we pass the user data on the request so we can use it in the next

  req.user = freshUser;

  // here we call the next function to go to the next middleware on the middleware stack

  res.locals.user = freshUser;

  console.log(`we have values here `)
  return next();
    }
    catch(err){
      console.log('error is here ')
      return next();
    }
  }


  next();
}; 

const restrictTo =
  (...roles) =>
  (req, res, next) => {
    const rolesState = roles.find((e) => req.user.role === e);

    if (!rolesState)
      return next(
        new AppError(
          'You are not have the permission to perform this action  ',
          403,
        ),
      );

    next();
  };

const forgetPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

 

  if (!email) return next(new AppError('Please provide your email', 400));

  //1) get the user based on the email

  const user = await User.findOne({ email });

  if (!user) return next(new AppError('There is no user with this email', 404));

  //2) generate the random set token
  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  //3) send it to the user's email

  // const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/restPassword/${resetToken}`

  const resetURL = `${req.protocol}://${req.host}:3000/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forget your Password ? Submit a Patch request with your new password and confirm password to : ${resetURL}.\n
      If you didn't forget your password , please ignore this Email`;

  try {
    console.log(`the user email is ${user.email}`);

      await sendEmail({
      email: user.email,
      subject: ' Your Password reset token valid  for 10 mintues',
      message: message,
      
    });

    res.status(200).json({
      status: 'success',
      message: 'token sent to email ',
    });
  } catch (err) {

    console.log(err);
    user.passwordResetToken = undefined;

    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });

    next(
      new AppError(`There's an error sending this email, try again later`, 500),
    );
  }
});

const resetPassword = catchAsync(async (req, res, next) => {


    //1) get the user with the token that on the params 

  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({passwordResetToken: hashedToken, passwordResetExpires: {$gt: Date.now()}});

    //2) if the token has not expired , and there is a user , set the new password

    if (!user) return next(new AppError('Token is invalid or has expired', 400));
      
    //3) update changePasswordAt property for the user

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    //4) log the user in again , send JWT 

    createSendToken(user, 200, res);
  
});


// const updatePassword = catchAsync(async (req, res , next)=>{

//   const {currentPassword, newPassword} = req.body;

//   //1) get the user from the collection by req.user which we make or create it in the protect route 

//   const user  = await User.findById(req.user._id);
  
//   if (!user ) return next(new AppError('There is no user with this id', 404));

//   //2)check the current password in the req.body is the same which for this user in the database
//   console.log(user);
//   const passwordState = await user.correctPassword(currentPassword, user.password);

//   console.log(passwordState);
//   if (!passwordState) return next(new AppError('Your current password is wrong', 401));

//   //3) if all above right then update the password

//   user.password = newPassword;
//   user.confirmPassword = newPassword;
//   await user.save();

//   //4) login again by create a new token 

//   const token  = signToken(user._id);

//   res.status(200).json({
//     status: 'success',
//     token
//   })

// })



// const updatePassword = catchAsync(async (req, res, next) => {
  
//   const {currentPassword, newPassword} = req.body;
//   // 1) get the user from the collection by the id of the req.user by the protect middleware 

//   const user = await User.findById(req.user._id).select('+password');

//   if (!user) return next(new AppError('There is no user with this id', 404));
//   //2) check if the current password user provide it in the body the same of the user we found 

//   const userPasswordState = await user.correctPassword(currentPassword, user.password);

//   if (!userPasswordState) return next(new AppError('Your current password is wrong', 401));
//   //3) update the password if all above true  

//   user.password = newPassword;
//   user.confirmPassword = newPassword;

//   await user.save();

//   //4) login again by create a new token

//   const token = signToken(user._id);

//   res.status(200).json({
//     status: 'success',
//     token
//   })
// })

// johans version of the function  
const updatePassword = catchAsync(async (req, res, next) => {
  
  const {currentPassword, newPassword} = req.body;

  //1) get the user from the collection 

  const user  = await User.findById(req.user._id).select('+password');

  if (!user) return next(new AppError('There is no user with this id', 404));

  //2) if the posted current  password is correct 

  const userPasswordState = await user.correctPassword(currentPassword, user.password);

  if (!userPasswordState) return next(new AppError('Your current password is wrong', 401));

  //3) set the new password or update it  

  user.password = newPassword;

  user.confirmPassword = newPassword;

  await user.save();
  //4) login again by create a new token

  createSendToken(user, 200, res);
});


const logout = (req,res)=>{

  res.cookie('jwt', 'LoggedOut', {
    expires: new Date(Date.now() + 10  * 1000),
    httpOnly: true
  });

  res.status(200).json({status: 'success'})
}
module.exports = {
  signUp,
  login,
  protect,
  restrictTo,
  forgetPassword,
  resetPassword,
  updatePassword,
  isLoggedIn,
  logout
};
