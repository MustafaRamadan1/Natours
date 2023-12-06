const rateLimiter = require('express-rate-limit');


const limiter = (maxRequests, Duration)=> rateLimiter({

    max: maxRequests,
    windowMs: Duration,
    message: "Too Much Requests , Please try after an hour"
    });



    module.exports = limiter;
