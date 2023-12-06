const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apifeatures');

const createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: doc,
    });
  });

const deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const Id = req.params.id;

    const doc = await Model.findByIdAndDelete(Id);

    if (!doc) return next(new AppError(' No Document with this ID', 404));
    res.status(204).json({
      status: 'success',
      message: 'deleted Success',
    });
  });

const updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const Id = req.params.id;

    const doc = await Model.findOneAndUpdate(Id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) return next(new AppError('No Document found with this ID', 404));
    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

const getOne = (Model, popOptions) => catchAsync(async (req, res, next) => {
    
  const { id } = req.params;

    let query = Model.findById(id).populate(popOptions);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) return next(new AppError('No Document found with this ID', 404));

    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });



  const getAll =  Model => catchAsync(async (req, res, next) => {

    // to allow Tourid 

      let filterObject = {};

  if (req.params.tourId) filterObject = { tour: req.params.tourId };
    // execute our query

    const features = new APIFeatures(Model.find(filterObject), req.query)
      .filter()
      .sort()
      .limitField()
      .paginate(3);
    const docs = await features.query;
    const DocumentsCount = await Model.countDocuments();
    // send response to the client for the request in true way or case
    res.status(200).json({
      status: 'success',
      pagesCount:( DocumentsCount / 2).toFixed(),
      result: docs.length,
      data: {
        docs,
      },
    });
  
});

module.exports = { createOne, deleteOne, updateOne, getOne,getAll};
