const express = require('express');

const {protect , restrictTo} = require('../controllers/authController');

const router = express.Router();

const {createReview, getAllReviews, deleteReview, updateReview, setUserTourIds, getReview} = require('../controllers/reviewController');



router.use(protect)

router.route('/').get(getAllReviews).post(protect , restrictTo('user') , setUserTourIds, createReview);


router.route('/:id').get(getReview).patch(restrictTo('user', 'admin'), updateReview ).delete(restrictTo('user', 'admin'), deleteReview)

module.exports = router;