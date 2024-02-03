import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
  extraHeaders: {
    authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NWIzYmVhNjJlYmE3OTI3ZWJjZmUxMTEiLCJpYXQiOjE3MDY4ODA1NTEsImV4cCI6MTcwNjk2Njk1MX0.qlauyycSv0Qxftn8CHxfqFg_SzW3u1OKi1TI41uzKhs`,
  },
});

socket.on('connect', () => {
  console.log('Connected to the server');

  socket.emit('friendRequest', { senderId: 'user1', receiverId: 'user2' });
});

socket.on('friendRequest', (data) => {
  console.log('Friend request received', data);
});
