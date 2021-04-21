const ws = createServer(app);
const io = socketIo(ws);

let interval;
io.on("connection", (socket) => {
    console.log("New client connected");
    if (interval) {
        clearInterval(interval);
    }

    interval = setInterval(() => getApiAndEmit(socket), 5000);
    socket.on("disconnect", () => {
        console.log("Client disconnected");
        clearInterval(interval);
    });
});

const getApiAndEmit = socket => {
    const response = {
        createdAt: "2021-04-20T10:28:10.350Z",
        _id: "607f3e6d28e6933afd67d61b",
        message: "ok bb",
        sender: {
            photo: "user-606dd1382c8d3418e4c37e7f-1618835235601.jpeg",
            role: "user",
            _id: "607e8b3279a7a3356406c691",
            name: "Foued"
        }
    }
}