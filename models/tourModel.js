const mongoose = require('mongoose');

const slugify = require('slugify');

const validator = require('validator');

const User = require('./userModel');


const toursSchema = new mongoose.Schema({
   

    name:  {
        type: String, 
        required: [true, 'A Tour must has a name '],
        unique: true, 
        trim: true,
        minLength: [10, 'The name minLength must be  at least 10 characters'],
        maxLength: [40, 'The name maxLength must be  Max 40 characters'],
    },
    duration: {
        type: Number,
        required:[true, 'A Tour Must have a duration']
    },
    maxGroupSize:{
        type: Number,
        required: [true, 'A Tour Must has a group Size']
    },
    difficulty: {
        type: String, 
        required: [true, 'A Tour Must has a difficulty'], 
        enum : ['easy', 'medium', 'difficult']
    },
    ratingsAverage : {
        type: Number,
        default : 4.5, 
        min: [1, 'The rating must be from 1.0'],
        max: [5, 'Rating must be equal or less than 5.0'],
        set: value => Math.round(value * 10) / 10
    }, 
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number, 
        required: [true, 'A Tour must has a price '],
    },
   priceDi: {
    type: Number, 
    validate: {
        validator: function (value)
        {
            return value < this.price
        }, 
        message: 'the tour discount should be less than the price the discount value is ({VALUE})',
    }
   }, 
   summary: {
    type: String, 
    trim: true,
    required: [true, 'A Tour must has a summary']
   },  
   description: {
    type: String, 
    trim: true
   }, 
   imageCover: {
    type: String, 
    required: [true, 'A Tour must has a Cover image']
   }, 
   images : [String], 
   createdAt : {
    type: Date, 
    default: Date.now()
   }, 
   startDates: [Date] , 
   slug: String, 
   secretTour: {
    type: Boolean, 
    default: false
   },
  
   startLocation : {
    type: {
        type: String,
        default: 'Point',
        enum: ['Point']
    }, 
    coordinates: [Number], 
    address: String,
    description: String,
   }, 

   locations: [
    {
        type: {
            type: String, 
            default: 'Point', 
            enum: ['Point']
        }, 
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
    }
   ], 

   guides: [
    {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }
   ]

}, {
    toJSON: {
        virtuals: true
    }, 
    toObject: {
        virtuals: true
    }, 
    id: false
});


// create index on a field 

toursSchema.index({price:1, ratingsAverage: -1});

toursSchema.index({slug: 1});

toursSchema.index({startLocation: '2dsphere'})

// Virtual Properties


toursSchema.virtual('durationsWeek').get(function (){
    return (this.durations / 4)
})

// Document MiddleWare 
toursSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true });
    next();
  });

// toursSchema.post('save', (doc , next) =>{
//     console.log('after save');
//     next();
// })



//Query Middleware 
// toursSchema.pre('find', function (next){

//     console.log(this);    
//     // this.find({secretTour : {$ne : true}});

//     next();
// })

//Aggregation middleware 

// toursSchema.pre('aggregate', function (next){

//     this.pipeline().unshift({$match: {secretTour : {$ne : true}}});

//     next();
// })

// toursSchema.post('aggregate', function (doc, next){
//     console.log(doc, this);
//     next();
// })



// toursSchema.pre('save' , async function (){

//     const guides = this.guides.map(async (id) => await User.findById(id));

//     this.guides = await Promise.all(guides);
// })


toursSchema.pre(/^find/, function(next){

    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt -passwordResetToken -passwordResetExpires'
    })
    next();
})



toursSchema.virtual('reviews', {

    ref: 'Review',
    foreignField: 'tour',
    localField: '_id',
    
})



const Tour = mongoose.model('Tour', toursSchema);


module.exports = Tour;
