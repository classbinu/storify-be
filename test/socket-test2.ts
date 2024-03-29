import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/ws-noti/', {
  extraHeaders: {
    authorization: `Bearer `,
  },
});

socket.on('connect', () => {
  console.log('Connected to the server as user2');

  socket.on('friendRequest', (data) => {
    console.log('Friend request received by user2', data);
  });
});
