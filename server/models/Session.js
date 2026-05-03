const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  currentCode: { type: String, default: '' },
  language: { type: String, default: 'javascript' },
  drawingActions: { type: Array, default: [] }, // Stores canvas actions for Excalidraw/Whiteboard
  participants: [{ 
    socketId: String, 
    userId: String, 
    username: String 
  }],
  createdAt: { type: Date, default: Date.now, expires: 86400 } // Auto-delete after 24 hours
});

module.exports = mongoose.model('Session', sessionSchema);
