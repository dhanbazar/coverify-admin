import { io, type Socket } from 'socket.io-client';
import { getStoredAuth } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
let socket: Socket | null = null;

export function connectWebSocket(): Socket {
  const auth = getStoredAuth();
  if (!auth.token) throw new Error('Not authenticated');

  socket = io(API_URL, {
    path: '/ws',
    auth: { token: auth.token },
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => console.log('WebSocket connected'));
  socket.on('disconnect', () => console.log('WebSocket disconnected'));

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectWebSocket(): void {
  socket?.disconnect();
  socket = null;
}
