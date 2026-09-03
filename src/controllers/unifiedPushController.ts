import type { Response } from "express"
import type { AuthenticatedRequest } from "../middlewares/auth"
import prisma from "../prisma"
import { sanitizeData, sendCommandToDeviceByPush } from "../utils"
import type { UnifiedPushProvider } from "../generated/prisma"
import { ringQueue } from "../services/ringQueue"
import { lockQueue } from "../services/lockQueue"
import { flashQueue } from "../services/flashQueue"
import {
  CONNECTIONS_CHANGE,
  FLASH_COMMAND,
  LOCK_COMMAND,
  RING_COMMAND,
} from "../types/Consts"
import { getIO } from "../socket"

export const register = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user!
    const rawProvider: UnifiedPushProvider = req.body

    if (!rawProvider) {
      res.status(400).json({ message: "UnifiedPush provider is missing" })
      return
    }

    const provider = await prisma.unifiedPushProvider.upsert({
      where: { endpoint_url: rawProvider.endpoint_url },
      update: {
        device_id: rawProvider.device_id,
        pub_key: rawProvider.pub_key,
        auth: rawProvider.auth,
        updated_at: new Date(),
      },
      create: {
        device_id: rawProvider.device_id,
        endpoint_url: rawProvider.endpoint_url,
        pub_key: rawProvider.pub_key,
        auth: rawProvider.auth,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

    // Check queues and send commands
    sendQueuedCommands(rawProvider.device_id)

    // Tell WebSocket listeners that a new device is online
    const io = getIO()
    io!.to(`user-${user.id}`).emit(CONNECTIONS_CHANGE)

    res.status(201).json({ unified_push_provider: sanitizeData(provider) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not register provider" })
  }
}

export const unregister = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user!
    const endpointUrl: string = req.body.endpoint_url

    if (!endpointUrl) {
      res.status(400).json({ message: "Endpoint URL is missing" })
      return
    }

    try {
      await prisma.unifiedPushProvider.delete({
        where: {
          endpoint_url: endpointUrl,
        },
      })
    } catch (error) {
      console.error(error)
    }

    // Tell WebSocket listeners that a device went offline
    const io = getIO()
    io!.to(`user-${user.id}`).emit(CONNECTIONS_CHANGE)

    res.status(204).send()
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not unregister provider" })
  }
}

function sendQueuedCommands(deviceId: bigint) {
  if (ringQueue.has(deviceId)) sendCommandToDeviceByPush(deviceId, RING_COMMAND)
  if (lockQueue.has(deviceId)) sendCommandToDeviceByPush(deviceId, LOCK_COMMAND)
  if (flashQueue.has(deviceId))
    sendCommandToDeviceByPush(deviceId, FLASH_COMMAND)
}
