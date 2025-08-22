import chalk from "chalk"
import express from "express"
import http from "http"
import logRequest from "./middlewares/logging"
import { PrismaClient, type users } from "./generated/prisma"
import { createIO } from "./socket"
import authRoutes from "./routes/authRoutes"
import settingRoutes from "./routes/settingRoutes"
import deviceRoutes from "./routes/deviceRoutes"
import locationRoutes from "./routes/locationRoutes"
import userRoutes from "./routes/userRoutes"
import tokenRoutes from "./routes/tokenRoutes"
import { authenticateIO } from "./middlewares/auth"
import cors from "cors"
import Bonjour from "bonjour"

const prisma = new PrismaClient()
const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)
      return callback(null, origin)
    },
    credentials: true,
  })
)
app.use(logRequest)

app.use("/api/auth", authRoutes)
app.use("/api/settings", settingRoutes)
app.use("/api/devices", deviceRoutes)
app.use("/api/locations", locationRoutes)
app.use("/api/user", userRoutes)
app.use("/api/tokens", tokenRoutes)

app.get("/api/status", async (req, res) => {
  try {
    const admin = await prisma.users.findFirst({
      where: {
        admin: true,
      },
    })

    const isSetup = !!admin

    const registration = await prisma.settings.findFirst({
      where: {
        key: "registration",
        value: "true",
      },
    })

    res.status(200).json({
      isSetup,
      registration: registration
        ? registration.value.toLowerCase() === "true"
        : false,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Internal server error" })
  }
})

// Websockets
const server = http.createServer(app)
const io = createIO(server, { cors: { origin: "*" } })

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
    const device = await prisma.devices.findUnique({ where: { id: deviceId } })
    if (!device) return socket.emit("error", "Device not found")
    if (device.user_id !== user.id) {
      return socket.emit("error", "You do not own this device")
    }

    socket.join(`device-${deviceId}`)
    console.log(`Device ${deviceId} joined room`)
  })

  socket.on("unregister-device", async ({ deviceId }) => {
    const device = await prisma.devices.findUnique({ where: { id: deviceId } })
    if (!device) return socket.emit("error", "Device not found")

    socket.leave(`device-${deviceId}`)
    console.log(`Device ${deviceId} left room`)
  })

  socket.on("ring", async ({ deviceId }) => {
    const device = await prisma.devices.findUnique({ where: { id: deviceId } })
    if (!device) return socket.emit("error", "Device not found")
    if (device.user_id !== user.id) {
      return socket.emit("error", "You do not own this device")
    }

    io.to(`device-${deviceId}`).emit("ring-command")
    console.log(`Sent ring to device ${deviceId}`)
  })

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`)
  })
})

const bonjour = Bonjour()

server.listen(PORT, () => {
  console.log(
    `🚀 Server running at ${chalk.yellow(`http://localhost:${PORT}`)}`
  )

  bonjour.publish({
    name: "Onloc Server",
    type: "http",
    port: Number(PORT),
  })
})
