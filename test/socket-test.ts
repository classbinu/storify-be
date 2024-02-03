import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/ws-noti/', {
  extraHeaders: {
    authorization: `Bearer `,
  },
});

socket.on('connect', () => {
  console.log('Connected to the server');

  socket.emit('friendRequest', { senderId: 'user1', receiverId: 'user2' });
});

socket.on('friendRequest', (data) => {
  console.log('Friend request received', data);
});
