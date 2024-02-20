import {
  OnGatewayInit,
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

interface ExtendedSocket extends Socket {
  timer?: NodeJS.Timeout;
}

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    allowedHeaders: ['authorization', 'Authorization'],
    credentials: true,
    transports: ['websocket'],
  },
  namespace: 'ws-noti',
})
export class NotiGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
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

  afterInit() {
    console.log('Server initialized');
  }

  async handleConnection(client: ExtendedSocket) {
    console.log('ws-noti connected');
    console.log(`Client connected: ${client.id}`);
    client.on('auth', async (token) => {
      try {
        const { sub } = await this.jwtService.decode(token);
        console.log(`sub: ${sub}`);
        this.users.set(sub, client.id);
        this.users.set(client.id, sub);
        const existingUser = this.users.get(sub);

        if (existingUser) {
          client.emit('message', 'You are already connected.');
        } else {
          this.users.set(sub, client.id);
          this.users.set(client.id, sub);
          console.log(this.users);
          client.emit('message', 'You have successfully connected.');
        }
      } catch (error) {
        client.emit('error', 'Invalid token. Connection refused.');
        client.disconnect();
      }
    });
    client.timer = setTimeout(
      () => {
        client.disconnect();
      },
      10 * 60 * 1000,
    );
  }

  async handleDisconnect(client: ExtendedSocket) {
    const userId = this.users.get(client.id);

    if (userId) {
      this.users.delete(client.id);
      this.users.delete(userId);
      console.log('Client disconnected: ' + client.id);
    }
    client.disconnect();
  }

  @SubscribeMessage('readNotification')
  async handleReadNotification(
    client: ExtendedSocket,
    @MessageBody() data: { notiId: string },
  ): Promise<void> {
    const { notiId } = data;
    client.timer = setTimeout(
      () => {
        client.disconnect();
      },
      10 * 60 * 1000,
    );
    await this.notiService.updateNotificationStatus(notiId, 'read');
  }
}
