const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 存储在线用户
const users = new Map();
const MAX_USERS = 4; // 限制最多4人

// 静态文件服务
app.use(express.static('public'));

// Socket.io 连接逻辑
io.on('connection', (socket) => {
  // 检查人数限制
  if (users.size >= MAX_USERS) {
    socket.emit('error', '聊天室已满（最多4人）');
    socket.disconnect();
    return;
  }

  // 新用户加入
  socket.on('join', (username) => {
    users.set(socket.id, username);
    io.emit('user-list', Array.from(users.values())); // 广播用户列表
    socket.broadcast.emit('message', `${username} 进入了聊天室`);
  });

  // 消息处理
  socket.on('message', (msg) => {
    const username = users.get(socket.id);
    io.emit('message', `${username}: ${msg}`); // 广播消息
  });

  // 用户断开
  socket.on('disconnect', () => {
    const username = users.get(socket.id);
    users.delete(socket.id);
    io.emit('user-list', Array.from(users.values()));
    socket.broadcast.emit('message', `${username} 离开了聊天室`);
  });
});

// 启动服务器
server.listen(3000, () => {
  console.log('Chat server running at http://localhost:3000');
});
