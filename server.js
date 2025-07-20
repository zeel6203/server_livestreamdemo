const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let broadcaster = null;
const viewers = new Set();

console.log('🚀 Starting WebRTC Signaling Server...');

io.on('connection', (socket) => {
  console.log('📱 Client connected:', socket.id);

  socket.on('join-as-broadcaster', () => {
    console.log('📺 Broadcaster joined:', socket.id);
    broadcaster = socket.id;
    socket.broadcast.emit('broadcaster-ready');
  });

  socket.on('join-as-viewer', () => {
    console.log('👀 Viewer joined:', socket.id);
    viewers.add(socket.id);
    
    if (broadcaster) {
      socket.emit('broadcaster-ready');
    }
  });

  socket.on('offer', (data) => {
    console.log('📡 Offer from broadcaster to viewer:', data.to);
    socket.to(data.to).emit('offer', {
      from: socket.id,
      offer: data.offer
    });
  });

  socket.on('answer', (data) => {
    console.log('✅ Answer from viewer to broadcaster:', data.to);
    socket.to(data.to).emit('answer', {
      from: socket.id,
      answer: data.answer
    });
  });

  socket.on('ice-candidate', (data) => {
    console.log('🧊 ICE candidate exchanged');
    socket.to(data.to).emit('ice-candidate', {
      from: socket.id,
      candidate: data.candidate
    });
  });

  socket.on('request-offer', () => {
    console.log('🙋 Viewer requesting offer');
    if (broadcaster) {
      io.to(broadcaster).emit('create-offer', { to: socket.id });
    }
  });

  socket.on('disconnect', () => {
    console.log('📱 Client disconnected:', socket.id);
    
    if (socket.id === broadcaster) {
      console.log('📺 Broadcaster disconnected - notifying viewers');
      broadcaster = null;
      socket.broadcast.emit('broadcaster-disconnected');
    } else {
      viewers.delete(socket.id);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🌐 Signaling server running on port ${PORT}`);
  console.log(`🔗 Server URL: http://localhost:${PORT}`);
  console.log('📝 Update this URL in your Flutter app code');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    broadcaster: broadcaster ? 'online' : 'offline',
    viewers: viewers.size,
    timestamp: new Date().toISOString()
  });
});

// Basic info endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'WebRTC Signaling Server',
    status: 'running',
    broadcaster: broadcaster ? 'online' : 'offline',
    viewers: viewers.size
  });
});
