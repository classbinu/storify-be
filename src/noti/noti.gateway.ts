import {
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { forwardRef, Inject } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { NotiService } from './noti.service';

interface ExtendedSocket extends Socket {
  userId?: string;
  timer?: NodeJS.Timeout;
}

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'https://storifyai.site'],
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
    client.on('auth', async (token) => {
      try {
        console.log(`Client connected: ${client.id}`);
        const { sub } = await this.jwtService.decode(token);
        console.log(`sub: ${sub}`);

        this.users.set(sub, client.id);
        this.users.set(client.id, sub);
        client.userId = sub;
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
      30 * 60 * 1000,
    );
  }

  async handleDisconnect(client: ExtendedSocket) {
    if (client.timer) {
      clearTimeout(client.timer);
    }
    const clientId = this.users.get(client.userId);
    if (clientId === client.id) {
      console.log('Client disconnected: ' + client.id);
      this.users.delete(client.userId);
    }
  }

  @SubscribeMessage('readNotification')
  async handleReadNotification(client: ExtendedSocket): Promise<void> {
    if (client.timer) {
      clearTimeout(client.timer);
      client.timer = setTimeout(
        () => {
          client.disconnect();
        },
        10 * 60 * 1000,
      );
    }
  }
}
