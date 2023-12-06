const express = require('express');

const {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
} = require('../controllers/UserControllers');

const {
  signUp,
  login,
  forgetPassword,
  resetPassword,
  updatePassword,
  protect,
  restrictTo,
  logout
} = require('../controllers/authController');

const router = express.Router();

// create user route " sign up "

router.post('/signUp', signUp);
router.post('/login', login);
router.get('/logout', logout)
router.post('/forgetPassword', forgetPassword);
router.patch('/resetPassword/:token', resetPassword);
router.route('/').get(getAllUsers)

router.use(protect);

router.patch('/updatePassword', updatePassword);
router.patch('/updateMe', updateMe);
router.delete('/deleteMe', deleteMe);

// get the current user data
router.get('/me', getMe, getUser);

router.use(restrictTo('admin'));

router.route('/').get(getAllUsers)
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
