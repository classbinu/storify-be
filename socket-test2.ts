import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/ws-noti/', {
  extraHeaders: {
    authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NWJlMjFjMTFlMzhjNTNhYjdjYjZmYzYiLCJpYXQiOjE3MDY5NjI3MjgsImV4cCI6MTcwNzA0OTEyOH0.kZtlNh5YVFC3wXi7e_4DHOzIPqdUwPQmxOamg-ZD5cw`,
  },
});

socket.on('connect', () => {
  console.log('Connected to the server as user2');

  socket.on('friendRequest', (data) => {
    console.log('Friend request received by user2', data);
  });
});
