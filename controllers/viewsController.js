const Tour = require('../models/tourModel');
const User = require('../models/userModel')
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const getOverview = catchAsync(async (req, res, next )=>{

  const headerContent = "default-src 'self' https://cdnjs.cloudflare.com/ajax/* ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com  'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"

  //1)  get Tour Data from the collection

    const tours = await Tour.find();

  //2) build template and then render using tour data from step 1
    res.status(200).setHeader('Content-Security-Policy', headerContent).render('overview', {
      title: 'All Tours',
      tours
    } )
  });


  const getTour = catchAsync(async(req, res , next)=>{
    
      const  CSP = 'Content-Security-Policy';
      const headerContent = "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
      const {slug} = req.params;
  
      //1)  get the data for the requested tour   
  
      const tour = await Tour.findOne({slug}).populate({
        path: 'reviews',
        fields: 'review  rating user',
      });


      if (!tour) return next(new AppError('There is no Tour with this name ', 404));

      
      //2) build the template 
  
      //3) render the data 
      res.status(200).setHeader(CSP, headerContent).render('tour', {
        title: `${tour.name}`,
        tour
  
    });
  })


  const getLogin = (req, res )=>{

    const headerContent = "default-src 'self' https://cdnjs.cloudflare.com/ajax/* ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com  'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"

    
    res.status(200).setHeader('Content-Security-Policy', headerContent).render('login', {
      title: 'Log Into your Account'
    })

  }


  const getAccount  = (req, res)=>{

    const headerContent = "default-src 'self' https://cdnjs.cloudflare.com/ajax/* ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com  'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"

    res.status(200).setHeader('Content-Security-Policy', headerContent).render('account',{
      title : 'Your Account',

    })
  }

  const updateUserData = catchAsync(async (req, res, next)=>{

    const {email, name} = req.body;
     const updatedUser = await User.findByIdAndUpdate(req.user.id, {
      name, email
     }, {
      new: true, 
      runValidators: true
     });


     res.status(200).render('account',{
      title: 'Your Account',
      user: updatedUser
     })


  });
  module.exports = {getOverview, getTour, getLogin,getAccount, updateUserData}