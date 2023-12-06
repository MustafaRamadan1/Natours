const EventEmitter = require('events').EventEmitter;


const logging = (req, res , next)=>{

    const logger = new EventEmitter();


    logger.on('log', function())

}


module.exports = logging