import { User } from "./user-manager";

var GLOBAL_ROOM_ID = 1;

interface Room {
  user1: User;
  user2: User;
}
export class RoomManager {
  private rooms: Map<string, Room>;
  constructor() {
    this.rooms = new Map<string, Room>();
  }
  createRoom(user1: User, user2: User) {
    const roomId = this.generate().toString();
    console.log("Room created : ", roomId);
    console.log("Room has : ", user1.name, user2.name);
    this.rooms.set(roomId.toString(), {
      user1,
      user2,
    });
    user1.socket.emit("send-offer", {
      roomId,
    });
    user2.socket.emit("send-offer", {
      roomId,
    });
  }

  onOffer(roomId: string, sdp: string) {
    console.log("Room offer : ", sdp.toString());
    const user2 = this.rooms.get(roomId)?.user2;
    user2?.socket.emit("offer", {
      sdp,
      roomId,
    });
  }

  onAnswer(roomId: string, sdp: string) {
    console.log("Room answer : ", sdp.toString());
    const user1 = this.rooms.get(roomId)?.user2;
    user1?.socket.emit("answer", {
      sdp,
      roomId,
    });
  }

  //if the user leaves the room
  deleteRoom(roomId: string) {
    const room = this.rooms.get(roomId);
  }

  generate() {
    return GLOBAL_ROOM_ID++;
  }
}
