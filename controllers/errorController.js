const AppError = require("../utils/appError");

const handleCastErrorDB = (err)=>{
     const message = ` the error field is ${err.path} and the value is ${err.value}`;

     return new AppError(message, 400);
}

const handleDepulicateErrorDB = (error)=>{

    const message = ` depulicate field value : ${error.keyValue.name}`;

    return new AppError(message, 400);
}


const handleValidationErrorDB = (error)=>{
   
    

    const  values = Object.values(error.errors).map((e)=> e.message);

    // for (let i in error.errors){
        
    //     values += error.errors[i].message + ' , ';
    // }

    const message = `Invalid input data : ${values.join(' , ')} `;
    return new AppError(message, 400);
}


const handleJWT = () => new AppError('Invalid Token please Login again', 401);


const handleJWTExpired = () => new AppError('Your Token Expired , Please Login again', 401);

const sendErrorDev = (res, req, error)=>{
    //API
    if(req.originalUrl.startsWith('/api')){
       return res.status(error.statusCode).json({
            status: error.status, 
            error: error, 
            message: error.message, 
            stack: error.stack
        })
    }

    console.log('Error: ' ,error);
        //RENDERED WEBSITE
       return  res.status(error.statusCode).render('error',{
            title: 'Something Went Wrong',
            msg: error.message
        });
    
}


const sendErrorProduction = (res, req, error)=>{
    //API
    if (req.originalUrl.startsWith('/api')){
        if (error.isOperational)
    {
        console.log(`the error statuscode is ${error.statusCode} and the message is ${error.message}`);
       
        res.status(error.statusCode).json({
            status: error.status, 
            message: error.message
        })
    }
    else
    {
        res.status(500).json({
            status: 'error', 
            message: 'something went very wrong!'
        })
    }
    }
    else
    {
        //RENDERED WEBSITE
        // eslint-disable-next-line no-lonely-if
        if (error.isOperational){

        console.log(`the error statuscode is ${error.statusCode} and the message is ${error.message}`);
       
       return res.status(error.statusCode).render('error',{
            title: `Something went Very Wrong`, 
            msg: error.message
        })
    }
  
        return res.status(500).render('error',{
            title: `Something went Very Wrong`, 
            msg: 'Please Try  Again Later'
        })
    
    }
}
module.exports = (error, req, res, next) => {

    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error';

    console.log(process.env.NODE_ENV);

    if (process.env.NODE_ENV === 'Development')
    {
        sendErrorDev(res,req, error);
    }
    else {
        console.log(error.message);
        let err = {...error}; 
        err.message = error.message;
        if (error.name === "CastError")
        {
            err = handleCastErrorDB(error);
        }
         if (error.code === 11000) err = handleDepulicateErrorDB(error);
        
         if (error.name === "ValidationError") err = handleValidationErrorDB(err);

         if (error.name === 'JsonWebTokenError') err = handleJWT();
        
        if (error.name === "TokenExpiredError") err = handleJWTExpired();
        sendErrorProduction(res, req, err);

    }
 
};


