import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export { BACKEND_URL };

export const socket = io(BACKEND_URL, {
  autoConnect: false,
  reconnection: true,
  transports: ['websocket', 'polling']
});

// Debug logging
socket.onAny((event, ...args) => {
  console.log(`[Socket] Event: ${event}`, args);
});

socket.on('connect', () => {
  console.log('[Socket] Connected! Socket ID:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('[Socket] Disconnected. Reason:', reason);
});

socket.on('connect_error', (err) => {
  console.error('[Socket] Connection error:', err);
});
