import dotenv from 'dotenv';
import { app } from './app.js';
import connectDB from './db/index.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { setupSocket } from './socket.js';

dotenv.config();

const server = createServer(app);
const io = new Server(server, { cors: { origin: process.env.CORS_ORIGIN || "*", methods: ["GET", "POST"] } });

// Socket.IO setup
setupSocket(io);

connectDB()
  .then(() => {
    server.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on PORT ${process.env.PORT || 5000}`);
    });
  })
  .catch((error) => {
    console.log("Error connecting to Database:", error);
  });
