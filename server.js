const mongoose = require('mongoose');
const dotenv = require('dotenv');
// eslint-disable-next-line import/extensions
const app = require('./app.js');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASS,
);

// mongoose.connect(DB, {
//   useNewUrlParser: true,
//   useCreateIndex: true,
//   useFindAndModify: false,
// }).then(()=> console.log(`Connection established`)).catch((error)=>{
//     console.log(error);
//     console.log(`connection failed`);
// });

mongoose
  .connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
   
  })
  .then(() => console.log('connection established'))
  .catch((error) => console.log(error));

const PORT = process.env.PORT;
const server = app.listen(PORT, '127.0.0.1', () =>
  console.log(`Server running on port ${PORT} 🔥`),
);

// Hello from ndb "Node Debugger"

// process.on('unhandledRejection', (err)=>{
//   console.log(err.name , err.message);

//   server.close(()=>{console.log('the server will close now ');})
//   process.exit(1);

// })

// process.on('uncaughtException', (err)=>{
//   console.log('uncaught exception');
// })
// console.log(x);
