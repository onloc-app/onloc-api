import type { Response } from "express"
import { type Device, type Location } from "../generated/prisma"
import type { AuthenticatedRequest } from "../middlewares/auth"
import prisma from "../prisma"
import { getIO } from "../socket"
import { sanitizeData } from "../utils"
import { ringQueue } from "../services/ringQueue"
import { checkPermissions } from "./userTierController"
import { lockQueue } from "../services/lockQueue"

interface DeviceExtra extends Device {
  latest_location: Location | null
  is_connected: boolean
}

export const createDevice = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user!
    const device: Device = req.body

    const existingDevice = await prisma.device.findFirst({
      where: {
        user_id: user.id,
        name: device.name,
      },
    })

    if (existingDevice) {
      res.status(400).json({ message: "Device already exists" })
      return
    }

    if (!user.admin) {
      const deviceCount = await prisma.device.count({
        where: { user_id: user.id },
      })
      const permissions = await checkPermissions(user.id)
      if (permissions && permissions.maxDevices !== null) {
        if (deviceCount >= permissions.maxDevices) {
          res
            .status(403)
            .json({ message: "Max devices allowed for this account reached" })
          return
        }
      }
    }

    const newDevice = await prisma.device.create({
      data: {
        user_id: user.id,
        name: device.name,
        icon: device.icon,
        can_ring: device.can_ring,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

    res.status(201).json({ device: sanitizeData(newDevice) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not create device" })
  }
}

export const readDevices = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user!

    const rawDevices = await prisma.device.findMany({
      where: {
        user_id: user.id,
      },
    })

    const devices: DeviceExtra[] = await Promise.all(
      rawDevices.map(async (device) => {
        const latest_location = await prisma.location.findFirst({
          where: { device_id: device.id },
          orderBy: { created_at: "desc" },
        })
        return {
          ...device,
          latest_location,
          is_connected: await checkConnection(device.id),
        }
      }),
    )

    res.status(200).json({ devices: sanitizeData(devices) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not read devices" })
  }
}

export const readDevice = async (
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

    const rawDevice = await prisma.device.findFirst({
      where: {
        id: BigInt(id as string),
      },
    })

    if (!rawDevice) {
      res.status(404).json({ message: "Device not found" })
      return
    }

    if (user.id !== rawDevice.user_id) {
      res.status(403).json({ message: "Forbidden" })
      return
    }

    const latest_location = await prisma.location.findFirst({
      where: {
        device_id: rawDevice.id,
      },
      orderBy: { created_at: "desc" },
    })

    const device: DeviceExtra = {
      ...rawDevice,
      latest_location,
      is_connected: await checkConnection(rawDevice.id),
    }

    res.status(200).json({ device: sanitizeData(device) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not read device" })
  }
}

export const updateDevice = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user!
    const device: Device = req.body

    const existingDevice = await prisma.device.findFirst({
      where: {
        id: device.id,
        user_id: user.id,
      },
    })

    if (!existingDevice) {
      res.status(404).json({ message: "Device not found" })
      return
    }

    const updated = await prisma.device.update({
      where: {
        id: device.id,
        user_id: user.id,
      },
      data: {
        ...device,
        updated_at: new Date(),
      },
    })

    res.status(200).json({ device: sanitizeData(updated) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not update device" })
  }
}

export const deleteDevice = async (
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

    const deleted = await prisma.device.delete({
      where: {
        id: BigInt(id as string),
        user_id: user.id,
      },
    })

    if (!deleted) {
      res.status(404).json({ message: "Device not found" })
      return
    }

    res.status(204).send()
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not delete device" })
  }
}

export const ringDevice = async (
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

    const device = await prisma.device.findFirst({
      where: {
        id: BigInt(id as string),
        user_id: user.id,
      },
    })

    if (!device) {
      res.status(404).json({ message: "Device not found" })
      return
    }

    if (!device.can_ring) {
      res.status(403).json({ message: "Device cannot be rung" })
      return
    }

    if (!(await checkConnection(BigInt(id as string)))) {
      ringQueue.add(BigInt(id as string))
      console.log(`Added ${id} to ring queue`)
      res.status(202).send()
      return
    }

    const io = getIO()
    io.to(`device-${id}`).emit("ring-command")
    console.log(`Sent ring to ${id}`)

    res.status(200).send()
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not ring device" })
  }
}

export const lockDevice = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user!
    const { id } = req.params
    const { message } = req.body ?? {}

    if (!id) {
      res.status(400).json({ message: "Id is missing" })
      return
    }

    const device = await prisma.device.findFirst({
      where: {
        id: BigInt(id as string),
        user_id: user.id,
      },
    })

    if (!device) {
      res.status(404).json({ message: "Device not found" })
      return
    }

    if (!device.can_lock) {
      res.status(403).json({ message: "Device cannot be locked" })
      return
    }

    if (!(await checkConnection(BigInt(id as string)))) {
      lockQueue.add(BigInt(id as string), message)
      console.log(`Added ${id} to lock queue`)
      res.status(202).send()
      return
    }

    const io = getIO()
    io.to(`device-${id}`).emit("lock-command", { message: message })
    console.log(`Sent lock to ${id}`)

    res.status(200).send()
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not lock device" })
  }
}

export const checkConnection = async (id: bigint) => {
  const roomName = `device-${id}`
  const socketsInRoom = await getIO().in(roomName).fetchSockets()
  return socketsInRoom.length > 0
}
