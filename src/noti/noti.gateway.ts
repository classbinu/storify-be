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
    origin: [
      'http://localhost:3000',
      'https://storifyai.site',
      'https://storifyai-dev.vercel.app',
      'https://storifyai.vercel.app',
    ],
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
    // console.log('Server initialized');
  }

  async handleConnection(client: ExtendedSocket) {
    client.on('auth', async (token) => {
      try {
        // console.log(`Client connected: ${client.id}`);
        const { sub } = await this.jwtService.decode(token);
        this.users.set(sub, client.id);
        this.users.set(client.id, sub);
        const existingUser = this.users.get(sub);
        if (existingUser) {
          client.emit('message', 'You are already connected.');
        } else {
          // console.log(this.users);
          client.emit('message', 'You have successfully connected.');
        }
      } catch (error) {
        client.emit('error', 'Invalid token. Connection refused.');
      }
    });
    client.timer = setTimeout(() => {
      client.disconnect();
    }, 6 * 1000);
  }

  async handleDisconnect(client: ExtendedSocket) {
    if (client.timer) {
      clearTimeout(client.timer);
    }
    const clientId = this.users.get(client.id);
    this.users.delete(clientId);
    // console.log('Client disconnected: ' + client.id);
    this.users.delete(client.id);
  }

  @SubscribeMessage('readNotification')
  async handleReadNotification(client: ExtendedSocket): Promise<void> {
    if (client.timer) {
      clearTimeout(client.timer);
      client.timer = setTimeout(() => {
        client.disconnect();
      }, 6 * 1000);
    }
  }
}
