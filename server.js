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
  io.emit('chat',"foued ta7cha")
  console.log("conx")
  socket.on('chat',(data) =>{
     console.log(data,"fffffffffffffffffff")
  })
  // const respence = {
	// 	createdAt: "2021-04-20T10:28:10.350Z",
	// 	_id: "607f3e6d28e6933afd67d61b",
	// 	message:"test",
	// 	sender: {
	// 	  photo: "user-606dd1382c8d3418e4c37e7f-1618835235601.jpeg",
	// 	  role: "user",
	// 	  _id: "607e8b3279a7a3356406c691",
	// 	  name: "Foued"
	// 	}
  // }
 
  socket.on("disconnect", () => {
  
    
   
  });
 
});

app.post('/api/v1/SendMessage/:conversationId', async (req, res, next) => {
  if (!req.body.message) {
    return next(new AppError("il faut saisir un message", 400));
  }
  const data = new message({
    conversationId: req.params.conversationId,
    message: req.body.message,
    sender: req.body.sender
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
