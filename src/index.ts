import { Bonjour } from "bonjour-service"
import chalk from "chalk"
import cors from "cors"
import express from "express"
import http from "http"
import { isRegistrationEnabled, isSetup } from "./helpers/statusHelper"
import logRequest from "./middlewares/logging"
import apiKeyRoutes from "./routes/apiKeyRoutes"
import authRoutes from "./routes/authRoutes"
import deviceRoutes from "./routes/deviceRoutes"
import locationRoutes from "./routes/locationRoutes"
import preferenceRoutes from "./routes/preferenceRoutes"
import settingRoutes from "./routes/settingRoutes"
import tierRoutes from "./routes/tierRoutes"
import tokenRoutes from "./routes/tokenRoutes"
import userRoutes from "./routes/userRoutes"
import { createIO } from "./socket"

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
  }),
)
app.use(logRequest)

app.use("/api/auth", authRoutes)
app.use("/api/settings", settingRoutes)
app.use("/api/devices", deviceRoutes)
app.use("/api/locations", locationRoutes)
app.use("/api/users", userRoutes)
app.use("/api/tokens", tokenRoutes)
app.use("/api/preferences", preferenceRoutes)
app.use("/api/apikeys", apiKeyRoutes)
app.use("/api/tiers", tierRoutes)

app.get("/api/status", async (req, res) => {
  try {
    res.status(200).json({
      isSetup: await isSetup(),
      registration: await isRegistrationEnabled(),
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Internal server error" })
  }
})

// Websockets
const server = http.createServer(app)
createIO(server, { path: "/ws", cors: { origin: "*" } })

const bonjour = new Bonjour()

server.listen(PORT, () => {
  console.log(`Server running at ${chalk.yellow(`http://localhost:${PORT}`)}`)

  bonjour.publish({
    name: "onloc",
    type: "http",
    protocol: "tcp",
    port: Number(PORT),
  })
})
