const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const {deleteOne, updateOne, getOne, getAll} = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};

  allowedFields.forEach((e) => {
    if (Object.keys(obj).includes(e)) newObj[e] = obj[e];
  });
  return newObj;
};


// const updateMe = catchAsync(async (req, res, next) => {
//   //1) create  error if the user posts password data

//   if (req.body.password || req.body.confirmPassword)
//     return next(
//       new AppError(
//         `you can't change password from this route , please go to /updatePassword`,
//         400,
//       ),
//     );

//   //2)  Update the user document

//   const filterBody = filterObj(req.body, 'name', 'email')
//   const user = await User.findByIdAndUpdate(req.user._id, filterBody, {
//     new: true,
//     runValidators: true,
//   });

//   res.status(200).json({
//     status: 'success',
//     date:{
//       user
//     }
//   });
// });

const updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.confirmPassword)
    return next(
      new AppError(
        `This route not for change password , please go to /updatePassword`,
      ),
    );

  const filterBody = filterObj(req.body, 'name', 'email');

  
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filterBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    date: {
      user: updatedUser,
    },
  });
});

const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({
    status: 'success',
    message: null,
  });
});

const getMe =  (req, res ,next)=>{

  req.params.id = req.user._id;
  next();
}
const getAllUsers = getAll(User)
const getUser = getOne(User);
const updateUser = updateOne(User);
const deleteUser = deleteOne(User);

module.exports = {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe
};
