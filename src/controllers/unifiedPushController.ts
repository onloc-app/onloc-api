import type { Response } from "express"
import type { AuthenticatedRequest } from "../middlewares/auth"
import prisma from "../prisma"
import { sanitizeData } from "../utils"
import type { UnifiedPushProvider } from "../generated/prisma"
import { NotificationService } from "../services/NotificationService"
import { QueueService } from "../services/QueueService"

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

    const existingProvider = await prisma.unifiedPushProvider.findUnique({
      where: { endpoint_url: rawProvider.endpoint_url },
    })

    const targetDeviceId = rawProvider.device_id ?? existingProvider?.device_id

    const device = targetDeviceId
      ? await prisma.device.findUnique({
          where: { id: targetDeviceId },
        })
      : null

    if (
      (existingProvider && existingProvider.user_id !== user.id) ||
      (device && device.user_id !== user.id)
    ) {
      res.status(403).json({ message: "Unauthorized" })
      return
    }

    const provider = await prisma.unifiedPushProvider.upsert({
      where: { endpoint_url: rawProvider.endpoint_url },
      update: {
        user_id: user.id,
        device_id: device?.id,
        pub_key: rawProvider.pub_key ?? existingProvider?.pub_key,
        auth: rawProvider.auth ?? existingProvider?.auth,
        updated_at: new Date(),
      },
      create: {
        user_id: user.id,
        device_id: device?.id,
        endpoint_url: rawProvider.endpoint_url,
        pub_key: rawProvider.pub_key ?? existingProvider?.pub_key,
        auth: rawProvider.auth ?? existingProvider?.auth,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

    if (device) {
      // Check queues and send commands
      QueueService.getInstance().sendQueuedCommands(device.id)

      // Tell WebSocket listeners that a new device is online
      await new NotificationService().emitConnectionChange(device)
    }

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

    const provider = await prisma.unifiedPushProvider.findUnique({
      where: {
        endpoint_url: endpointUrl,
      },
      include: {
        device: true,
      },
    })

    if (!provider) {
      res.status(404).json({ message: "Provider not found" })
      return
    }

    if (provider.user_id !== user.id) {
      res.status(403).json({ message: "Unauthorized" })
      return
    }

    await prisma.unifiedPushProvider.deleteMany({
      where: { endpoint_url: endpointUrl },
    })

    // Tell WebSocket listeners that a device went offline
    const device = provider.device
    if (device) await new NotificationService().emitConnectionChange(device)

    res.status(204).send()
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not unregister provider" })
  }
}
