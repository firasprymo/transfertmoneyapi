const { ieNoOpen } = require("helmet");
const catchAsync = require("../utils/catchAsync");
//const io = require("socket.io");
//const express = require("express");
// const app = express();
// const http = require("http").Server(app);


// socket = io(http);

exports.chat =catchAsync(async (io) => {
  // socket.on("connection", socket => {
  //   console.log("user connected");

  //   socket.on("disconnect", function () {
  //     console.log("user disconnected");
  //   });

  //   //Someone is typing
  //   socket.on("typing", data => {
  //     socket.broadcast.emit("notifyTyping", {
  //       user: data.user,
  //       message: data.message
  //     });
  //   });

  //   //when soemone stops typing
  //   socket.on("stopTyping", () => {
  //     socket.broadcast.emit("notifyStopTyping");
  //   });

  //   socket.on("chat message", function (msg) {
  //     console.log("message: " + msg);

  //     //broadcast message to everyone in port:5000 except yourself.
  //     socket.broadcast.emit("received", { message: msg });

  //     //save chat to the database
  //     connect.then(db => {
  //       console.log("connected correctly to the server");
  //       let chatMessage = new Chat({ message: msg, sender: "Anonymous" });

  //       chatMessage.save();
  //     });
  //   });
  // })
  io.on('connection',async socket =>{
    console.log("connection")
    socket.on('tuping',async msg =>{
      console.log(msg)
     // socket.broadcast.emit("typing",{msg:msg.name})
    });
  })

})

