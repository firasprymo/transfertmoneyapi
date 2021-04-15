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
let interval;
const users = []
 

io.on("connection", (socket) => {
   console.log("New client connected");
//  console.log("ddd")
// console.log(socket);
// console.log(socket.rooms);
  socket.on('userdata', (user) => {
  console.log(user)
  socket.emit("FromAPI", user);
    users.push(user)
    updateClients();
    
    // socket.username = user.username;
    // socket.name = user.name;
    socket.on('disconnect', () => {
    });
  });


  if (interval) {
    clearInterval(interval);
  }
  interval = setInterval(() => getApiAndEmit(socket), 5000);
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    clearInterval(interval);
  });
});
ws.listen(4112, () => {
  console.log("df")
})


const getApiAndEmit = socket => {
  const response = "hello socket"
  // Emitting a new message. Will be consumed by the client
  socket.emit("FromAPI", response);
};





























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
