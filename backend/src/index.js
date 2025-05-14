import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './lib/db.js';
import authRoutes from './routes/auth.routes.js';
import messageRoutes from './routes/message.routes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('🟢 New socket connection:', socket.id);
  socket.on('disconnect', () => {
    console.log('🔴 Disconnected:', socket.id);
  });
});

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

// Apply CORS headers on all responses, including errors
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/message', messageRoutes);

// Start server
server.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  try {
    await connectDB();
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
  }
});
