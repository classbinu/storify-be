import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/ws-noti/', {
  extraHeaders: {
    authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NWJlMjFiYTFlMzhjNTNhYjdjYjZmYmYiLCJpYXQiOjE3MDY5NjI3MDksImV4cCI6MTcwNzA0OTEwOX0.x8ALiCSllgxuyUFkdvu3onjDi8OpHB_2eUd8DO3MM70`,
  },
});

socket.on('connect', () => {
  console.log('Connected to the server');

  socket.emit('friendRequest', { senderId: 'user1', receiverId: 'user2' });
});

socket.on('friendRequest', (data) => {
  console.log('Friend request received', data);
});
