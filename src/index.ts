import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import cors from "cors";
import { createOrJoinRoom, leaveRoom } from "./rooms/handleJoinLeaveRoom";

const app = express();
app.use(cors()); // Enable CORS for all routes

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Change this to the frontend URL
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.get("/", (req, res) => {
  res.send("<h1>Hello world</h1>");
});

export type Room = {
  players: string[];
  game: any;
};

export type User = {
  socket: string;
  room: string;
};

const allRooms: { [key: string]: Room } = {};
const allUsers: { [key: string]: string } = {};

const maxPlayersInRoom = 2;

io.on("connection", (socket) => {
  console.log(socket.id + " connected");

  io.emit("joined", JSON.stringify({ message: "A user joined", socket: socket.id }));
  createOrJoinRoom(allRooms, allUsers, socket, io, maxPlayersInRoom);

  socket.on("disconnect", () => {
    leaveRoom(allRooms, allUsers, socket);
  });
});

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});
