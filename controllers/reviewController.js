const Review = require('../models/reviewModel');
const AppError = require('../utils/appError');
// const catchAsync = require('../utils/catchAsync');
const { createOne, deleteOne, updateOne, getOne, getAll } = require('./handlerFactory');

const setUserTourIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId ;
  if (!req.body.user) req.body.user = req.user.id;

  if (!req.body)
    return next(new AppError('please provide a review Details', 400));

    console.log(req.body);
  next();
};
const createReview = createOne(Review);

const getAllReviews = getAll(Review)
const getReview = getOne(Review);

const updateReview = updateOne(Review);

const deleteReview = deleteOne(Review);

module.exports = { createReview, getAllReviews, deleteReview, updateReview, setUserTourIds,getReview };
