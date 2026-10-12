import type { Server as HTTPServer } from "http"
import { Server as SocketIOServer, type ServerOptions } from "socket.io"
import type { User } from "./generated/prisma"
import { authenticateIO } from "./middlewares/auth"
import prisma from "./prisma"
import { REGISTER_DEVICE, UNREGISTER_DEVICE } from "./types/Consts"
import { NotificationService } from "./services/NotificationService"
import chalk from "chalk"
import { QueueService } from "./services/QueueService"

let io: SocketIOServer | null = null

export function getIO() {
  if (!io) throw new Error("Socket.io not initialized")
  return io
}

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

    console.log(`New client connected: ${chalk.blue(socket.id)}`)

    socket.join(`user-${user.id}`)
    console.log(`User ${chalk.blue(user.username)} joined room`)

    socket.on(REGISTER_DEVICE, async ({ device_id }) => {
      if (!device_id) {
        console.error(`Event: ${REGISTER_DEVICE}, called without device_id`)
        return
      }
      const device = await prisma.device.findUnique({
        where: { id: device_id },
      })
      if (!device) return socket.emit("error", "Device not found")
      if (device.user_id !== user.id) {
        return socket.emit("error", "You do not own this device")
      }

      socket.join(`device-${device_id}`)
      new NotificationService().emitConnectionChange(device)
      console.log(`Device ${chalk.blue(device_id)} joined room`)

      const formattedDeviceId = BigInt(device_id)
      QueueService.getInstance().sendQueuedCommands(formattedDeviceId)
    })

    socket.on(UNREGISTER_DEVICE, async ({ device_id }) => {
      if (!device_id) {
        console.error(`Event: ${UNREGISTER_DEVICE}, called without device_id`)
        return
      }
      const device = await prisma.device.findUnique({
        where: { id: device_id },
      })
      if (!device) return socket.emit("error", "Device not found")

      socket.leave(`device-${device_id}`)
      new NotificationService().emitConnectionChange(device)
      console.log(`Device ${chalk.blue(device_id)} left room`)
    })

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${chalk.blue(socket.id)}`)
    })
  })

  return io
}
