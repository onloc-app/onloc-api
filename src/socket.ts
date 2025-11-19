import { Server as SocketIOServer, type ServerOptions } from "socket.io"
import type { Server as HTTPServer } from "http"
import { authenticateIO } from "./middlewares/auth"
import type { users } from "./generated/prisma"
import { PrismaClient } from "./generated/prisma"

const prisma = new PrismaClient()
let io: SocketIOServer | null = null

export function createIO(
  server: HTTPServer,
  options: Partial<ServerOptions> = {},
) {
  if (io) return io
  io = new SocketIOServer(server, options)

  io.use(authenticateIO)

  io.on("connection", (socket) => {
    const user = socket.data.user as users
    if (!user) {
      console.log("No user attached to socket")
      socket.disconnect()
      return
    }

    console.log(`New client connected: ${socket.id}`)

    socket.on("register-device", async ({ deviceId }) => {
      const device = await prisma.devices.findUnique({
        where: { id: deviceId },
      })
      if (!device) return socket.emit("error", "Device not found")
      if (device.user_id !== user.id) {
        return socket.emit("error", "You do not own this device")
      }

      socket.join(`device-${deviceId}`)
      io!.to(`user_${user.id}`).emit("connectionsUpdate")
      console.log(`Device ${deviceId} joined room`)
    })

    socket.on("unregister-device", async ({ deviceId }) => {
      const device = await prisma.devices.findUnique({
        where: { id: deviceId },
      })
      if (!device) return socket.emit("error", "Device not found")

      socket.leave(`device-${deviceId}`)
      io!.to(`user_${user.id}`).emit("connectionsUpdate")
      console.log(`Device ${deviceId} left room`)
    })

    socket.on("ring", async ({ deviceId }) => {
      const device = await prisma.devices.findUnique({
        where: { id: deviceId },
      })
      if (!device) return socket.emit("error", "Device not found")
      if (device.user_id !== user.id) {
        return socket.emit("error", "You do not own this device")
      }

      io!.to(`device-${deviceId}`).emit("ring-command")
      console.log(`Sent ring to device ${deviceId}`)
    })

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`)
    })
  })

  return io
}

export function getIO() {
  if (!io) throw new Error("Socket.io not initialized")
  return io
}
