import type { Server as HTTPServer } from "http"
import { Server as SocketIOServer, type ServerOptions } from "socket.io"
import type { User } from "./generated/prisma"
import { authenticateIO } from "./middlewares/auth"
import prisma from "./prisma"
import { ringQueue } from "./services/ringQueue"
import { lockQueue } from "./services/lockQueue"

let io: SocketIOServer | null = null

export function createIO(
  server: HTTPServer,
  options: Partial<ServerOptions> = {},
) {
  if (io) return io
  io = new SocketIOServer(server, options)

  io.use(authenticateIO)

  io.on("connection", (socket) => {
    const user = socket.data.user as User
    if (!user) {
      console.log("No user attached to socket")
      socket.disconnect()
      return
    }

    console.log(`New client connected: ${socket.id}`)

    socket.on("register-device", async ({ device_id }) => {
      const device = await prisma.device.findUnique({
        where: { id: device_id },
      })
      if (!device) return socket.emit("error", "Device not found")
      if (device.user_id !== user.id) {
        return socket.emit("error", "You do not own this device")
      }

      socket.join(`device-${device_id}`)
      io!.to(`user_${user.id}`).emit("connections-change")
      console.log(`Device ${device_id} joined room`)

      const formattedDeviceId = BigInt(device_id)

      // Ring the device if it's in the queue
      if (ringQueue.has(formattedDeviceId)) {
        io!.to(`device-${formattedDeviceId}`).emit("ring-command")
        console.log(`Sent queued ring to ${formattedDeviceId}`)
        ringQueue.remove(formattedDeviceId)
      }

      // Lock the device if it's in the queue
      if (lockQueue.has(formattedDeviceId)) {
        const message = lockQueue.getMessage(formattedDeviceId)
        io!
          .to(`device-${formattedDeviceId}`)
          .emit("lock-command", { message: message })
        console.log(`Sent queued lock to ${formattedDeviceId}`)
        lockQueue.remove(formattedDeviceId)
      }
    })

    socket.on("unregister-device", async ({ device_id }) => {
      const device = await prisma.device.findUnique({
        where: { id: device_id },
      })
      if (!device) return socket.emit("error", "Device not found")

      socket.leave(`device-${device_id}`)
      io!.to(`user_${user.id}`).emit("connections-change")
      console.log(`Device ${device_id} left room`)
    })

    socket.on("ring", async ({ device_id }) => {
      const device = await prisma.device.findUnique({
        where: { id: device_id },
      })
      if (!device) return socket.emit("error", "Device not found")
      if (device.user_id !== user.id) {
        return socket.emit("error", "You do not own this device")
      }

      io!.to(`device-${device_id}`).emit("ring-command")
      console.log(`Sent ring to device ${device_id}`)
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
