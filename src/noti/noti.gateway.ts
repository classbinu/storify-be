import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
  MessageBody,
} from '@nestjs/websockets';
import { forwardRef, Inject } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { NotiService } from './noti.service';

@WebSocketGateway(3001, {
  cors: {
    origin: '*', // 모든 도메인에서의 접근을 허용합니다. 실제 사용 시에는 보안을 위해 구체적인 도메인을 명시하는 것이 좋습니다.
    credentials: true, // 쿠키를 사용할 경우 true로 설정
  },
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

  @SubscribeMessage('friendRequest')
  handleFriendRequest(@MessageBody() payload: any): WsResponse<any> {
    const { senderId, receiverId } = payload;
    const receiverSocketId = this.users.get(receiverId);

    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('friendRequest', { senderId });
    }

    return { event: 'friendRequest', data: 'completed' };
  }

  @SubscribeMessage('readNotification')
  async handleReadNotification(
    @MessageBody() data: { notiId: string },
  ): Promise<void> {
    const { notiId } = data;
    await this.notiService.updateNotificationStatus(notiId, 'read');
  }
}
