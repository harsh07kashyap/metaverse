// const express=require('express');
// const bodyParser=require('body-parser');
const { Server } = require("socket.io");

const io = new Server(8000, { cors: true });
// const app=express();

// app.use(bodyParser.json());
const emailToSocketIdMap = new Map();
const socketidToEmailMap = new Map();

io.on("connection", (socket) => {
  console.log(`socket id ${socket.id} connected`);
  console.log("New connection");
  socket.on("room:join", (data) => {
    const { roomId, userId } = data;
    // console.log(`User ${userId} joined room ${roomId}`);
    emailToSocketIdMap.set(userId, socket.id);
    socketidToEmailMap.set(socket.id, userId);
    io.to(roomId).emit("user:joined", { userId, id: socket.id });
    socket.join(roomId);
    io.to(socket.id).emit("room:join", data);
  });
  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incomming:call", { from: socket.id, offer });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    // console.log("peer:nego:needed", offer);
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    // console.log("peer:nego:done", ans);
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });

  socket.on("disconnect", () => {
    const userId = socketidToEmailMap.get(socket.id);
    console.log(`🔌 User disconnected: ${userId}, socket: ${socket.id}`);

    // Inform everyone in rooms this user was in
    const rooms = Array.from(socket.rooms).filter((r) => r !== socket.id);
    rooms.forEach((roomId) => {
      socket.to(roomId).emit("user:disconnected", { socketId: socket.id });
    });

    // Cleanup maps
    emailToSocketIdMap.delete(userId);
    socketidToEmailMap.delete(socket.id);
  });
});

// io.listen(8001,()=>{
//     console.log('Socket.IO server is running on port 8001');
// })
