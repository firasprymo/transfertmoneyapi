const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { createServer } = require('http');
const socketIo = require("socket.io");
const catchAsync = require("./src/utils/catchAsync");
const message = require('./src/models/messageModel');

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
//  const senddata = () =>{
//   io.emit('visitor','helllllllllllll')
//  }
io.on("connection", (socket) => {
  io.emit('chat',socket.id)
  socket.emit('connection:sid', socket.id);
  socket.on('chat',(data) =>{

  })
  socket.on("disconnect", () => {
  
    
   
  });
 
});

app.post('/SendMessage/:conversationId', async (req, res, next) => {
  console.log('hhhhhhhhhhhhhh')
  if (!req.body.message) {
    return next(new AppError("il faut saisir un message", 400));
  }
  const data = new message({
    conversationId: req.params.conversationId,
    message: req.body.message,
   // sender: req.user.id
  });
  io.emit('chat',data);
  data.save(function (err, sentReply) {
    if (err) {
      res.send({ message: 'message non envoyer ' });
      return next(err);
    }

    res.status(200).json({ message: 'message envoyer avec succés', data: req.body.message });
    return (next);
  });

});



ws.listen(port, () => {
  console.log(`App running on port ${port}...`)
})



// process.on('unhandledRejection', err => {
//   console.log('UNHANDLED REJECTION! 💥 Shutting down...');
//   console.log(err, err.name, err.message);
//   server.close(() => {
//     process.exit(1);
//   });
// });

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});
