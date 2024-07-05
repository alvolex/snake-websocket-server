import { Server, Socket } from "socket.io";
import { Room } from "..";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

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
