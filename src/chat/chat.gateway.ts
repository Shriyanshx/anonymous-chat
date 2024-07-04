// src/chat/chat.gateway.ts
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private waitingUsers: Socket[] = [];
  private activeChats: Map<Socket, Socket> = new Map();

  handleConnection(client: Socket) {
    this.addUserToQueue(client);
    this.matchUsers();
  }

  handleDisconnect(client: Socket) {
    this.removeUser(client);
    const partner = this.activeChats.get(client);
    if (partner) {
      this.activeChats.delete(partner);
      this.activeChats.delete(client);
      partner.emit('partnerDisconnected');
      this.addUserToQueue(partner);
    }
  }

  @SubscribeMessage('message')
  handleMessage(@MessageBody() message: { sender: string; content: string }) {
    const partner = this.activeChats.get(this.server.sockets.sockets.get(message.sender));
    if (partner) {
      console.log('message', message);
      partner.emit('message', message);
    }
  }

  @SubscribeMessage('next')
  handleNext(client: Socket) {
    const partner = this.activeChats.get(client);
    if (partner) {
      this.activeChats.delete(partner);
      this.activeChats.delete(client);
      partner.emit('partnerDisconnected');
      this.addUserToQueue(partner);
    }
    this.addUserToQueue(client);
    this.matchUsers();
  }

  private matchUsers() {
    while (this.waitingUsers.length >= 2) {
      const user1 = this.waitingUsers.shift();
      const user2 = this.waitingUsers.shift();
      this.activeChats.set(user1, user2);
      this.activeChats.set(user2, user1);
      user1.emit('matched', { partner: user2.id });
      user2.emit('matched', { partner: user1.id });
    }
  }

  private addUserToQueue(user: Socket) {
    this.waitingUsers.push(user);
  }

  private removeUser(client: Socket) {
    const index = this.waitingUsers.indexOf(client);
    if (index !== -1) {
      this.waitingUsers.splice(index, 1);
    }
  }
}
