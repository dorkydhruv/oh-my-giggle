import { Socket } from "socket.io";
import { RoomManager } from "./room-manager";

export interface User {
  name: string;
  socket: Socket;
}

export class UserManager {
  private users: User[];
  private queue: string[];
  private roomManager: RoomManager;
  constructor() {
    this.users = [];
    this.queue = [];
    this.roomManager = new RoomManager();
  }
  addUser(name: string, socket: Socket) {
    this.users.push({
      name,
      socket,
    });
    console.log("Adding", name);
    this.queue.push(socket.id);
    console.log("Queue", this.queue);
    socket.send("lobby"); //waiting for match
    this.clearQueue();
    this.initHandlers(socket);
  }
  removeUser(socketId: string) {
    const user = this.users.find((x) => x.socket.id === socketId);
    this.users = this.users.filter((x) => x.socket.id !== socketId);
    this.queue = this.queue.filter((x) => x === socketId);
  }
  clearQueue() {
    if (this.queue.length < 2) {
      return;
    }
    const user1Id = this.queue.pop();
    const user2Id = this.queue.pop();
    console.log("Matched", user1Id, user2Id);
    const user1 = this.users.find((x) => x.socket.id === user1Id);
    const user2 = this.users.find((x) => x.socket.id === user2Id);
    if (!user2 || !user1) return;
    const room = this.roomManager.createRoom(user1, user2);
  }
  initHandlers(socket: Socket) {
    socket.on("offer", ({ sdp, roomId }: { sdp: string; roomId: string }) => {
      console.log("In offer");
      this.roomManager.onOffer(roomId, sdp);
    });
    socket.on("answer", ({ sdp, roomId }: { sdp: string; roomId: string }) => {
      console.log("In answer");
      this.roomManager.onAnswer(roomId, sdp);
    });
  }
}
