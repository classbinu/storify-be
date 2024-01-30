import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway()
export class NotiGateway {
  @WebSocketServer()
  server: Server;

  private users = new Map<string, string>();
  public findUserSocketId(userId: string): string | undefined {
    return this.users.get(userId);
  }
  constructor(private readonly jwtService: JwtService) {}

  @SubscribeMessage('connection')
  handleConnection(client: any, payload: any): void {
    const token = payload.token;
    const decodedToken = this.jwtService.verify(token);
    const userId = decodedToken.sub;

    this.users.set(userId, client.id);
  }

  @SubscribeMessage('friendRequest')
  handleFriendRequest(client: any, payload: any): WsResponse<any> {
    const { senderId, receiverId } = payload;
    const receiverSocketId = this.users.get(receiverId);

    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('friendRequest', { senderId });
    }

    return { event: 'friendRequest', data: 'completed' };
  }
}
