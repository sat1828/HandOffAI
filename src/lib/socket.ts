import { Server as HTTPServer } from 'http';
import { Server } from 'socket.io';

let io: Server | null = null;

const sseClients = new Map<string, Set<ReadableStreamDefaultController>>();

export function getIO(httpServer?: HTTPServer) {
  if (!io && httpServer) {
    io = new Server(httpServer, {
      cors: { origin: '*', methods: ['GET', 'POST'] },
      path: '/api/socket',
    });

    io.on('connection', (socket) => {
      const userId = socket.handshake.query.userId as string;
      if (userId) socket.join(`user:${userId}`);
    });
  }
  return io;
}

export function addSSEClient(userId: string, controller: ReadableStreamDefaultController) {
  if (!sseClients.has(userId)) sseClients.set(userId, new Set());
  sseClients.get(userId)!.add(controller);
}

export function removeSSEClient(userId: string, controller: ReadableStreamDefaultController) {
  const clients = sseClients.get(userId);
  if (clients) {
    clients.delete(controller);
    if (clients.size === 0) sseClients.delete(userId);
  }
}

export function emitToUser(userId: string, event: string, data: Record<string, unknown>) {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }

  const clients = sseClients.get(userId);
  if (clients) {
    const encoder = new TextEncoder();
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const controller of clients) {
      try {
        controller.enqueue(encoder.encode(message));
      } catch {
        clients.delete(controller);
      }
    }
  }
}
