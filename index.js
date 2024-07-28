import express from "express";
import bodyParser from "body-parser";
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const PORT = 3000;
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.get("/rules", (req, res) => {
    res.render("rules.ejs");
});

app.get("/about", (req, res) => {
    res.render("about.ejs");
});

app.get("/chat", (req, res) => {
    res.render("chat.ejs");
});

let socketsConnected = new Set();
let userId = 0;

io.on('connection', (socket) => {
    console.log(`A user connected: ${socket.id}`);
    socketsConnected.add(socket.id);

    userId++;
    socket.userId = userId;

    io.emit('clients-total', socketsConnected.size);
    io.emit('user-joined', { userId: socket.userId });

    socket.on("disconnect", () => {
        console.log(`A user disconnected: ${socket.id}`);
        socketsConnected.delete(socket.id);
        io.emit('clients-total', socketsConnected.size);
    });

    socket.on('message', (data) => {
        console.log(data);
        socket.broadcast.emit('chat-message', data);
    });

    socket.on('feedback', (data) => {
        socket.broadcast.emit('feedback', data);
    })
});

server.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});
