import { Server, Socket } from "socket.io";
import { Room } from "..";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

export const createOrJoinRoom = (
  allRooms: { [key: string]: Room },
  allUsers: { [key: string]: string },
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  maxPlayersInRoom: number
) => {
  //if there are no rooms, create a room
  if (Object.keys(allRooms).length === 0) {
    allRooms[socket.id] = {
      players: [socket.id],
      game: {},
    };
    allUsers[socket.id] = socket.id;
    socket.join(socket.id);
  } else {
    //if there are rooms, check if there is a room with less than 2 players
    const room = Object.keys(allRooms).find(
      (room) => allRooms[room].players.length < maxPlayersInRoom
    );
    if (room) {
      allRooms[room].players.push(socket.id);
      allUsers[socket.id] = room;
      socket.join(room);
    } else {
      allRooms[socket.id] = {
        players: [socket.id],
        game: {},
      };
      allUsers[socket.id] = socket.id;
      socket.join(socket.id);
    }
    //if there are rooms with 2 players, start the game
    if (room && allRooms[room].players.length === maxPlayersInRoom) {
      io.to(room).emit(
        "startGame",
        JSON.stringify({ message: "Game started", room: room })
      );
    }
  }

  console.log(JSON.stringify(allRooms));
  console.log('Currently ' + Object.keys(allRooms).length + ' active rooms.');
};

export const leaveRoom = (
  allRooms: { [key: string]: Room },
  allUsers: { [key: string]: string },
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
  console.log("a user disconnected");
  const room = allUsers[socket.id];
  allRooms[room].players = allRooms[room].players.filter(
    (player) => player !== socket.id
  );
  if (allRooms[room].players.length === 0) {
    delete allRooms[room];
  }

  delete allUsers[socket.id];
  socket.leave(room);
};
