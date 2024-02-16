// npx ts-node socket-test.ts  - 테스트 코드
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/ws-noti', {
  transportOptions: {
    polling: {
      extraHeaders: {
        Authorization: 'Bearer ', // 여기에 토큰을 넣어주세요
      },
    },
  },
});

if (!socket.connected) {
  socket.connect();
}

socket.once('connect', () => {
  console.log('Connected to ws-noti');
  socket.emit('auth', '');
});

socket.on('message', (message: string) => {
  console.log('Message from server:', message);
});

socket.on('error', (error: string) => {
  console.log('Error from server:', error);
});

socket.on('disconnect', () => {
  console.log('Disconnected from ws-noti');
});
