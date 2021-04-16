
exports = module.exports = function (io) {
 var users = []
// USER STATUS LOGS START
  io.sockets.on('connection', (socket) => {
    console.log(' SOCKET ID ON SERVER ' + socket.id);
    console.log("hhhh")
    socket.on('userdata', (user) =>{
      socket.user = user;
      users.push(user)
     
    });
    socket.on('disconnect', () => {
    });

// USER STATUS LOGS END
    
//  CHATROOM Routines start

    socket.on('join', (data) => {
      socket.join(data.room);
      let rooms = Object.keys(socket.rooms);
    });

    socket.on('leave', (data) => {
      socket.leave(data.room);
    });
//  CHATROOM Routines end


// DIRECT MESSAGE Routines start

    socket.on('message', (message) => {
      message = JSON.parse(message);
      io.sockets.in(message.conversation_id).emit('new message', message);

      io.in(message.conversation_id).clients((error, clients) => {
        if (error) throw error;
      })
    });
  });


// DIRECT MESSAGE Routines end
}