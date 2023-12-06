const path = require('path');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookiesParser = require('cookie-parser');
const AppError = require('./utils/appError');

const GlobalErrorMiddleware = require('./controllers/errorController');

const limiter = require('./utils/rate-Limiter');

const app = express();

// setup the template engine

//1) define the template engine we use 

app.set('view engine', 'pug');

//2) define the path of the views

app.set('views', path.join(__dirname, 'views'));

// 1- Middlewares


// set or add  Security HTTP headers

app.use(helmet());

// info about the request came to us
app.use(morgan('dev')); // give me info for your request

// limit the number of request  from same IP
app.use('/api', limiter(100, 60 * 60 * 1000));

// reading data from the body into req.body

app.use(express.json()); // it help you to parse the request body and has it on the request


app.use(express.urlencoded({extended: true, limit: '10kb'}))
 
// using cookie-parser package to parse the cookies of the request

app.use(cookiesParser());

// Data Sanitization against NOSQL Injection

app.use(mongoSanitize());
// Data Sanitization against XSS "scripting"

// prevent paramter pollution 
app.use(hpp({
  whitelist: [
    'durations', "ratingsQuantity", "ratingsAverage", "maxGroupSize" , "difficulty", "price"
  ]
}));
app.use(express.static('public')); // middleware to host the static files of the server

// 2- Route Handlers

// 3- Routes

const UserRouter = require('./routes/usersRoutes');
const TourRouter = require('./routes/toursRoutes');
const reviewsRoutes = require('./routes/reviewRoutes');
const viewsRoutes = require('./routes/viewRoutes');
/* if any request came on route that start with this route go
 to this router and excute the middleware match the method and the rest of the part of the url too*/
app.use('/', viewsRoutes);
app.use('/api/v1/tours', TourRouter);
app.use('/api/v1/users', UserRouter);
app.use('/api/v1/reviews', reviewsRoutes);


app.all('*', (req, res, next) => {
  //`can't find ${req.originalUrl} on this server`

  const newError = new AppError(
    `can't find ${req.originalUrl} on this server`,
    404,
  );

  next(newError);
});


app.use(GlobalErrorMiddleware);

// app.get('/api/v1/tours', getAllTours);

// app.get('/api/v1/tours/:id', getTour);

// app.post('/api/v1/tours', createTour);

// app.patch('/api/v1/tours/:id', updateTour )

// app.delete('/api/v1/tours/:id', deleteTour)

// Start  the server

module.exports = app;
