import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import cors from "cors";

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
  roomId: string;
};

export type User = {
  socket: string;
  room: string;
};

const allRooms: { [key: string]: Room } = {};
const allUsers: { [key: string]: User } = {};

const maxPlayersInRoom = 2;

io.on("connection", (socket) => {
  socket.on("join-room", (data) => {
    //Check if there are any rooms available, if not create a new room (dont use existing function)
    const room = Object.values(allRooms).find(
      (room) => room.players.length < maxPlayersInRoom
    );

    // If there are no rooms available, create a new room
    if (!room) {
      const roomId = Math.random().toString(36).substring(7);
      allRooms[roomId] = {
        players: [socket.id],
        game: {},
        roomId: roomId,
      };
      allUsers[socket.id] = {
        socket: socket.id,
        room: roomId,
      };
      socket.join(roomId);
    } else {
      allRooms[room.roomId].players.push(socket.id);
      allUsers[socket.id] = {
        socket: socket.id,
        room: room.roomId,
      };
      socket.join(room.roomId);
    }
  });

  //handle disconnect
  socket.on("disconnect", () => {
    const user = allUsers[socket.id];
    if (user) { // Check if user is defined
      const room = allRooms[user.room];
      if (room) {
        room.players = room.players.filter((player) => player !== socket.id);
        if (room.players.length === 0) {
          delete allRooms[user.room];
        }
      }
      delete allUsers[socket.id];
    }
  });

  socket.on("change-direction", (data) => {
    console.log(data);
  });

  socket.on("snake-position", (data) => {
    const user = allUsers[socket.id];
    socket.to(user.room).emit("snake-position", data);
  });
});

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});
