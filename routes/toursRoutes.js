const express = require('express');

const {getAllTours, getTour, createTour, deleteTour, updateTour, aliasTopTours,
     getTopTours, getTourStates, getMonthlyPlan, getToursWithin, getDistances, testStats} = require('../controllers/TourController');

const {protect, restrictTo} = require('../controllers/authController');

const {createReview, getAllReviews, setUserTourIds} = require('../controllers/reviewController');

const router = express.Router();


router.route('/top-5-cheap').get(aliasTopTours, getTopTours)
router
.route('/')
.get(getAllTours)
.post( protect, restrictTo('admin' , 'lead-guide'), createTour);

router.route('/tours-stats').get(getTourStates);
router.route('/monthly-plan/:year').get(protect, restrictTo('admin' , 'lead-guide'),getMonthlyPlan);

router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(getDistances);

router.get('/testStats', testStats)

router
.route('/:id')
.get(getTour)
.patch(protect, restrictTo('admin' , 'lead-guide'),updateTour)
.delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);



router.route('/:tourId/review').post(protect, setUserTourIds, createReview).get(protect, getAllReviews)






module.exports = router;
