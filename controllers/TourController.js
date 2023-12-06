const Tour = require('../models/tourModel');

const APIFeatures = require('../utils/apifeatures');

const AppError = require('../utils/appError');


const catchAsync = require('../utils/catchAsync');

const {createOne, deleteOne, updateOne, getOne, getAll} = require('./handlerFactory');


const aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingAverage,price';
  req.query.fields = 'name durations maxGroupSize price summary description';

  next();
};

const getTopTours = catchAsync(async (req, res, next) => {
  
    const newFeature = new APIFeatures(Tour.find(), req.query);

    newFeature.sort().query.limit(+newFeature.queryString.limit);

    // const sort = req.query.sort.split(',').join(' ');

    // Query = Query.sort(sort).limit(+req.query.limit);

    newFeature.query.select(newFeature.queryString.fields);

    const tours = await newFeature.query;
    res.status(200).json({
      status: 'success',
      result: tours.length,
      data: tours,
    });
 
});

const getAllTours = getAll(Tour);

const getTour = getOne(Tour,{ path: 'reviews'} )



const createTour =  createOne(Tour);
const updateTour = updateOne(Tour);
const deleteTour = deleteOne(Tour);

const getTourStates = catchAsync(async (req, res, next) => {

    // const stats = await Tour.aggregate([
    //   {
    //     $match: { price: {$gte: 500 }}       // to filter it's like the filter object in find
    //   },
    //   {
    //     $group: {
    //       _id: '$maxGroupSize',
    //       avgRating: {$avg: '$ratingAverage'},
    //       avgPrice: {$avg: '$price'},
    //       minPrice: {$min: '$price'},
    //       maxPrice: {$max: '$price'}
    //     }
    //   },
    //   {
    //     $sort :{minPrice : 1 }
    //   },
    //   {
    //     $match : {_id : 5}
    //   }
    // ]);

    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gt: 4.6 } },
      },
      {
        $group: {
          _id: {$toUpper: '$difficulty'},
          nums: {$sum : 1},
          NumRatings: {$sum : '$ratingsQuantity'},
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: { difficulty: 1 },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: stats,
    });
  
});

const getMonthlyPlan = catchAsync(async (req, res, next)=>{

  
    const year = req.params.year;

    const plan =  await Tour.aggregate([
      {
        $unwind: '$startDates'
      }, 
      {
        $match: {startDates : {$gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`)}}
      }, 
      {
        $group:{
          _id: {$month: '$startDates'},
          numToursStart: {$sum: 1}, 
          Tours: {$push: '$name'}, 
        }
      },
      {
        $addFields: {month: '$_id'}
      } ,
      {
        $project:{
          _id: 0
        }
      },
      {
        $sort: { numToursStart: -1
        }
      }, 
      {
        $limit: 2
      }
    ])



    
    res.status(200).json({
      status: 'success',
      result: plan.length,
      data: plan,
    });
  })
 



  const getToursWithin = catchAsync(async (req, res , next)=>{
      
    const {distance, latlng, unit} = req.params;

    const [lat , lng] = latlng.split(',');

    if (!lat ||  !lng) {
      next(new AppError('Please Provide latitude and longitude in the format lat,long.', 400))
    }

    const radius = unit==='mi'? distance / 3963.2: distance / 6378.1;

    const tours = await Tour.find({startLocation: {
      $geoWithin:{
        $centerSphere: [[lat, lng], radius]
      } 
    }});

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        data: tours
      }
    })
  })


//router.route('/distances/:latlng/unit/:unit').get(getDistances);



// const getDistances = catchAsync(async (req, res , next)=>{

//     const {latlng, unit} = req.params;

//     const [lat, lng] = latlng.split(',');

//     if (!lat || !lng) return next(new AppError('Please Provide latitude and longitude in the format lat,long.', 400))

//     const multi = unit === "mi"? 0.000621371 : 0.01;


//     const distances = await Tour.aggregate([
//       {
//         $geoNear: {
//           near: {
//             type: 'Point',
//             coordinates: [lng * 1, lat * 1]
//           },
//           distanceField: 'distance',
//           distanceMultiplier: multi
//         },
//       },
//       {
//         $project: {
//           distance: 1,
//           name: 1
//         }
//       }

//     ]);

    
//     res.status(200).json({
//       status: 'success',

//       data: {
//         data: distances
//       }
//     })
// })


const getDistances = catchAsync(async(req, res , next)=>{

  const {latlng, unit} = req.params;

  const [lat, lng] = latlng;

  const multi = unit === "mi"? 0.000621371 : 0.001;


  const distances = await Tour.aggregate([
    
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: 'distance',
        distanceMultiplier: multi
      }
    }, {
      $project:{
        distance: 1,
        name: 1 
      }
     
    }
    
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances
    }
  })

})


const testStats = catchAsync(async (req, res , next)=>{

  const tours = await Tour.aggregate([
    {
      $match: {ratingsAverage: {$gte: 4.6}}
    },
    {
      $sort: {ratingsAverage: -1}
    }, 
    {
      $limit: 5
    },
    {
      $project: {
        name: 1,
        price: 1,
        ratingsAverage: 1,
        ratingsQuantity: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    tours
  })
})



module.exports = {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTopTours,
  getTourStates,
  getMonthlyPlan, 
  getToursWithin,
  getDistances,
  testStats


};
