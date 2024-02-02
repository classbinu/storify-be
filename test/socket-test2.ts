import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
  extraHeaders: {
    authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NWIzYmViNDJlYmE3OTI3ZWJjZmUxMTgiLCJpYXQiOjE3MDY4ODA1NzAsImV4cCI6MTcwNjk2Njk3MH0.73aSN9-JYF2nKhe_JOEzNiD31_G0SxN9M76KSBX41DU`,
  },
});

socket.on('connect', () => {
  console.log('Connected to the server as user2');

  socket.on('friendRequest', (data) => {
    console.log('Friend request received by user2', data);
  });
});
