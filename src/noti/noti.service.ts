import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { Types } from 'mongoose';

@Injectable()
export class NotiService {
  // 웹소켓 서버 객체
  private server: Server;

  constructor() {
    // 웹소켓 서버 초기화
    this.server = new Server(4000);
  }

  async sendNotification(userId: Types.ObjectId, message: string) {
    // 웹소켓 서버를 통해 클라이언트에게 알림 전송
    this.server.to(userId.toString()).emit('notification', { message });
  }
}
