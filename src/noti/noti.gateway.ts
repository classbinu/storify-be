import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
} from '@nestjs/websockets';
import { forwardRef, Inject } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { NotiService } from './noti.service';

@WebSocketGateway({
  cors: {
    // origin: ['http://localhost:3000/', 'http://storify-be.fly.dev/'],
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['authorization', 'Authorization'],
    credentials: true,
  },
  namespace: '/ws-.+/',
  transports: ['websocket'],
})
export class NotiGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private users = new Map<string, string>();

  public getUserSocketId(userId: string): string | undefined {
    return this.users.get(userId);
  }

  constructor(
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => NotiService))
    private readonly notiService: NotiService,
  ) {}

  async verifyToken(client: Socket): Promise<string> {
    const token = client.handshake.headers.authorization?.split(' ')[1];
    try {
      const { userId } = await this.jwtService.decode(token);
      return userId;
    } catch (error) {
      client.emit('error', 'Invalid token. Connection refused.');
      client.disconnect();
    }
  }

  async handleConnection(client: Socket) {
    const userId: string = await this.verifyToken(client);
    const socketId = this.users.get(userId);

    if (socketId) {
      client.emit('message', 'You are already connected.');
    } else {
      this.users.set(userId, client.id);
      this.users.set(client.id, userId);
      client.emit('message', 'You have successfully connected.');
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = this.users.get(client.id);

    if (userId) {
      this.users.delete(client.id);
      this.users.delete(userId);
      client.emit('message', 'You have successfully disconnected.');
    }
    client.disconnect();
  }

  @SubscribeMessage('readNotification')
  async handleReadNotification(
    @MessageBody() data: { notiId: string },
  ): Promise<void> {
    const { notiId } = data;
    await this.notiService.updateNotificationStatus(notiId, 'read');
  }
}
