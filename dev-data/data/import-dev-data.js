const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');


dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASS,
);
const LocalDB= process.env.DATABASE_LOCAL;

mongoose.connect(LocalDB, {
    useNewUrlParser: true, 
    useUnifiedTopology: true
}).then(()=> console.log('connection established')).catch((error)=> console.log(error));


const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));


const createDocuments = async ()=>{

   try 
   {
    await Tour.create(tours);
    await User.create(users, {validateBeforeSave: false});
    await Review.create(reviews);

    console.log('Documents created');
   }

   catch (err)
   {
    console.log(err);
   }

   process.exit();
}


const deleteDocuments = async ()=>{

    try 
    {
     await Tour.deleteMany();
     await User.deleteMany();
     await Review.deleteMany();

     console.log('Documents Deleted');
    }
 
    catch (err)
    {
     console.log(err);
    }
    process.exit();
 }


 if (process.argv[2] === "--delete")
{
   deleteDocuments();
}
else
{
    createDocuments();}

 console.log(process.argv);


