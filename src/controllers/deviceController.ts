import type { Response } from "express"
import {
  type Device,
  type DeviceShare,
  type Location,
} from "../generated/prisma"
import type { AuthenticatedRequest } from "../middlewares/auth"
import prisma from "../prisma"
import { getIO } from "../socket"
import { sanitizeData } from "../utils"
import { ringQueue } from "../services/ringQueue"
import { checkPermissions } from "./userTierController"
import { lockQueue } from "../services/lockQueue"
import {
  hasLockAccessToDevice,
  hasReadAccessToDevice,
  hasRingAccessToDevice,
} from "../helpers/access"

interface DeviceExtra extends Device {
  latest_location?: Location | null
  device_share?: DeviceShare | null
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
        color: device.color,
        icon: device.icon,
        can_ring: device.can_ring,
        can_lock: device.can_lock,
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

    const formattedId = BigInt(id as string)

    const hasAccess = await hasReadAccessToDevice(formattedId, user.id)
    if (!hasAccess) {
      res.status(403).json({ message: "Forbidden" })
      return
    }

    const rawDevice = await prisma.device.findFirst({
      where: {
        id: formattedId,
      },
    })

    if (!rawDevice) {
      res.status(404).json({ message: "Device not found" })
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

    const formattedId = BigInt(id as string)

    const hasAccess = await hasRingAccessToDevice(formattedId, user.id)
    if (!hasAccess) {
      res.status(403).json({ message: "Not authorized to ring this device" })
      return
    }

    const device = await prisma.device.findFirst({
      where: {
        id: formattedId,
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

    if (!(await checkConnection(formattedId))) {
      ringQueue.add(formattedId)
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

    const formattedId = BigInt(id as string)

    const hasAccess = await hasLockAccessToDevice(formattedId, user.id)
    if (!hasAccess) {
      res.status(403).json({ message: "Not authorized to lock this device" })
      return
    }

    const device = await prisma.device.findFirst({
      where: {
        id: formattedId,
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

    if (!(await checkConnection(formattedId))) {
      lockQueue.add(formattedId, message)
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

export const readSharedDevices = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user!

    const connections = await prisma.connection.findMany({
      where: {
        OR: [{ requester_id: user.id }, { addressee_id: user.id }],
      },
      include: {
        deviceShares: {
          include: {
            device: true,
          },
        },
      },
    })

    // Grab devices connected to the user excluding its own
    const rawDeviceShares = connections
      .flatMap((connection) => {
        return connection.deviceShares
      })
      .filter((deviceShare) => deviceShare.device.user_id !== user.id)

    const devices: DeviceExtra[] = await Promise.all(
      rawDeviceShares.map(async (deviceShare) => {
        const device = deviceShare.device
        const latestLocation = await prisma.location.findFirst({
          where: { device_id: device.id },
          orderBy: { created_at: "desc" },
        })
        const filteredDeviceShare = {
          ...deviceShare,
          device: undefined,
        }
        return {
          ...device,
          latest_location: latestLocation,
          device_share: filteredDeviceShare,
          is_connected: await checkConnection(device.id),
        }
      }),
    )

    res.status(200).json({ devices: sanitizeData(devices) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not read shared devices" })
  }
}

export const checkConnection = async (id: bigint) => {
  const roomName = `device-${id}`
  const socketsInRoom = await getIO().in(roomName).fetchSockets()
  return socketsInRoom.length > 0
}
