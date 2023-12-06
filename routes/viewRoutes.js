const express = require('express');
const {getOverview , getTour, getLogin, getAccount, updateUserData} = require('../controllers/viewsController');
const { protect, isLoggedIn } = require('../controllers/authController');

const router = express.Router();

router.get('/login', getLogin)
router.get('/', isLoggedIn, getOverview);
router.get('/tour/:slug', isLoggedIn,  getTour);
router.get('/me', protect,  getAccount);
router.post('/submit-user-data', protect,  updateUserData)
module.exports = router;