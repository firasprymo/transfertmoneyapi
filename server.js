const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { createServer } = require('http');
const socketIo = require("socket.io");
//const chatController = require('./src/controllers/chatController')
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err, err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => console.log('DB connection successful!'));

const port = process.env.PORT || 3000;
// const server = app.listen(port, () => {
//   console.log(`App running on port ${port}...`);
// });


const ws = createServer(app);
const io = socketIo(ws);

ws.listen(port, () => {
  console.log(`App running on port ${port}...`)
})
io.use(async(socket,next) =>{
  try {
    const token = socket.handshake.query.token;
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    console.userId(decoded)
    socket.userId = decoded.id;
    next()
  }catch(err){}
})

io.on("connection", (socket) => {
  console.log("New client connected"+socket.userId);
  
   
    socket.on('disconnect', () => {
    });
 

});





process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err, err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});
