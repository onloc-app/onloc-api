import { Server as SocketIOServer, type ServerOptions } from "socket.io"
import type { Server as HTTPServer } from "http"

let io: SocketIOServer | null = null

export function createIO(
  server: HTTPServer,
  options: Partial<ServerOptions> = {}
) {
  if (io) return io
  io = new SocketIOServer(server, options)
  return io
}

export function getIO() {
  if (!io) throw new Error("Socket.io not initialized")
  return io
}
