import type { Response } from "express"
import type { AuthenticatedRequest } from "../middlewares/auth"
import type { DeviceShare } from "../generated/prisma"
import prisma from "../prisma"
import { sanitizeData } from "../utils"

export const createDeviceShare = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user!
    const deviceShare: DeviceShare = req.body

    const existingDeviceShare = await prisma.deviceShare.findFirst({
      where: {
        connection_id: deviceShare.connection_id,
        device_id: deviceShare.device_id,
      },
    })

    if (existingDeviceShare) {
      res.status(400).json({ message: "Device share already exists" })
      return
    }

    const connection = await prisma.connection.findFirst({
      where: {
        id: deviceShare.connection_id,
        OR: [{ requester_id: user.id }, { addressee_id: user.id }],
      },
    })

    const otherUserId =
      connection?.addressee_id !== user.id
        ? connection?.addressee_id
        : connection?.requester_id

    const device = await prisma.device.findFirst({
      where: {
        id: deviceShare.device_id,
        user_id: user.id,
      },
    })

    if (!connection || !otherUserId) {
      res.status(404).json({ message: "Connection not found" })
      return
    }

    if (!device) {
      res.status(404).json({ message: "Device not found" })
      return
    }

    if (connection.status !== "ACCEPTED") {
      res.status(403).json({ message: "Forbidden" })
      return
    }

    const newDeviceShare = await prisma.deviceShare.create({
      data: {
        connection_id: connection.id,
        device_id: device.id,
        user_id: otherUserId,
        can_ring: deviceShare.can_ring,
        can_lock: deviceShare.can_lock,
        can_flash: deviceShare.can_flash,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

    res.status(201).json({ device_share: sanitizeData(newDeviceShare) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not create device share" })
  }
}

export const readDeviceShares = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user!

    const rawDeviceShares = await prisma.deviceShare.findMany({
      where: {
        connection: {
          OR: [{ requester_id: user.id }, { addressee_id: user.id }],
        },
      },
      include: {
        device: true,
      },
    })

    res.status(200).json({ device_shares: sanitizeData(rawDeviceShares) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not read device shares" })
  }
}

export const deleteDeviceShare = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user!
    const { id } = req.params

    if (!id) {
      res.status(400).json({ message: "Id is missing" })
      return
    }

    const deleted = await prisma.deviceShare.delete({
      where: {
        id: BigInt(id as string),
        device: {
          user_id: user.id,
        },
      },
    })

    if (!deleted) {
      res.status(404).json({ message: "Device share not found" })
      return
    }

    res.status(204).send()
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not delete device share" })
  }
}
