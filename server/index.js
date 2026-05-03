const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const cron = require('node-cron');
const axios = require('axios');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/code', require('./routes/code'));

// Health check endpoint for self-ping
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Socket.IO Setup
const registerRoomHandlers = require('./socket/roomHandlers');
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  registerRoomHandlers(io, socket);
  
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Self-ping to prevent Render free tier from sleeping
  // Pings every 10 minutes (Render sleeps after 15 min of inactivity)
  if (process.env.NODE_ENV === 'production') {
    const SELF_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
    
    cron.schedule('*/10 * * * *', async () => {
      try {
        const response = await axios.get(`${SELF_URL}/health`);
        console.log(`[Self-Ping] ✓ Keep-alive ping successful at ${new Date().toISOString()}`);
        console.log(`[Self-Ping] Status: ${response.data.status}, Uptime: ${Math.floor(response.data.uptime)}s`);
      } catch (error) {
        console.error(`[Self-Ping] ✗ Keep-alive ping failed:`, error.message);
      }
    });
    
    console.log('[Self-Ping] Keep-alive cron job started (every 10 minutes)');
  }
});
