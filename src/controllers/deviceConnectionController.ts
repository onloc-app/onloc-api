import type { Response } from "express"
import type { AuthenticatedRequest } from "../middlewares/auth"
import type { DeviceConnection } from "../generated/prisma"
import prisma from "../prisma"
import { sanitizeData } from "../utils"

export const createDeviceConnection = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user!
    const deviceConnection: DeviceConnection = req.body

    const existingDeviceConnection = await prisma.deviceConnection.findFirst({
      where: {
        connection_id: deviceConnection.connection_id,
        device_id: deviceConnection.device_id,
      },
    })

    if (existingDeviceConnection) {
      res.status(400).json({ message: "Device connection already exists" })
      return
    }

    const connection = await prisma.connection.findFirst({
      where: {
        id: deviceConnection.id,
        OR: [{ requester_id: user.id }, { addressee_id: user.id }],
      },
    })

    const device = await prisma.device.findFirst({
      where: {
        id: deviceConnection.device_id,
        user_id: user.id,
      },
    })

    if (!connection) {
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

    const newDeviceConnection = await prisma.deviceConnection.create({
      data: {
        connection_id: connection.id,
        device_id: device.id,
        can_ring: deviceConnection.can_ring,
        can_lock: deviceConnection.can_lock,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

    res
      .status(201)
      .json({ device_connection: sanitizeData(newDeviceConnection) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not create device connection" })
  }
}

export const readDeviceConnections = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user!

    const rawDeviceConnections = await prisma.deviceConnection.findMany({
      where: {
        connection: {
          OR: [{ requester_id: user.id }, { addressee_id: user.id }],
        },
      },
      include: {
        device: true,
      },
    })

    res
      .status(200)
      .json({ device_connections: sanitizeData(rawDeviceConnections) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not read device connections" })
  }
}

export const deleteDeviceConnection = async (
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

    const deleted = await prisma.deviceConnection.delete({
      where: {
        id: BigInt(id as string),
        device: {
          user_id: user.id,
        },
      },
    })

    if (!deleted) {
      res.status(404).json({ message: "Device connection not found" })
      return
    }

    res.status(204).send()
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not delete device connection" })
  }
}
