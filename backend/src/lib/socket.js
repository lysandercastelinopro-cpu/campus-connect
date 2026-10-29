import {Server} from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === "production"
      ? (process.env.CLIENT_URL ? [process.env.CLIENT_URL] : true)
      : allowedOrigins,
    credentials: true,
  },
});

// Map of userId (string) -> Set of active socket IDs
const userSocketMap = new Map();

export function getReceiverSocketId(userId) {
  if (!userId) return null;
  const sockets = userSocketMap.get(String(userId));
  if (!sockets || sockets.size === 0) return null;
  // Return the most recently connected active socket ID
  return Array.from(sockets).pop();
}

io.on("connection", (socket) => {
    console.log("User connected", socket.id);

    const rawUserId = socket.handshake.query.userId;
    const userId = rawUserId && rawUserId !== "undefined" && rawUserId !== "null"
      ? String(rawUserId)
      : null;

    if (userId) {
      if (!userSocketMap.has(userId)) {
        userSocketMap.set(userId, new Set());
      }
      userSocketMap.get(userId).add(socket.id);
    }

    // Broadcast list of active online user IDs to all clients
    io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));

    socket.on("disconnect", () => {
        console.log("User disconnected", socket.id);
        if (userId && userSocketMap.has(userId)) {
          const userSockets = userSocketMap.get(userId);
          userSockets.delete(socket.id);
          if (userSockets.size === 0) {
            userSocketMap.delete(userId);
          }
        }
        io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
    });
});

export {io, app, server}
