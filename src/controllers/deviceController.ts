import type { Response } from "express"
import { PrismaClient, type devices, type locations } from "../generated/prisma"
import type { AuthenticatedRequest } from "../middlewares/auth"
import { sanitizeData } from "../utils"

const prisma = new PrismaClient()

interface DeviceWithLatestLocation extends devices {
  latest_location: locations | null
}

export const createDevice = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user
    const device: devices = req.body

    const existingDevice = await prisma.devices.findFirst({
      where: {
        name: device.name,
      },
    })

    if (existingDevice) {
      res.status(400).json({ message: "Device already exists" })
      return
    }

    const newDevice = await prisma.devices.create({
      data: {
        user_id: user.id,
        name: device.name,
        icon: device.icon,
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
  res: Response
): Promise<void> => {
  try {
    const user = req.user

    const rawDevices = await prisma.devices.findMany({
      where: {
        user_id: user.id,
      },
    })

    const devices: DeviceWithLatestLocation[] = await Promise.all(
      rawDevices.map(async (device) => {
        const latest_location = await prisma.locations.findFirst({
          where: { device_id: device.id },
          orderBy: { created_at: "desc" },
        })
        return { ...device, latest_location }
      })
    )

    res.status(200).json({ devices: sanitizeData(devices) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not read devices" })
  }
}

export const readDevice = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user
    const { id } = req.params

    if (!id) {
      res.status(400).json({ message: "Id is missing" })
      return
    }

    const rawDevice = await prisma.devices.findFirst({
      where: {
        id: BigInt(id),
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

    const latest_location = await prisma.locations.findFirst({
      where: {
        device_id: rawDevice.id,
      },
      orderBy: { created_at: "desc" },
    })

    const device: DeviceWithLatestLocation = {
      ...rawDevice,
      latest_location,
    }

    res.status(200).json({ device: sanitizeData(device) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not read device" })
  }
}

export const updateDevice = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user
    const device: devices = req.body

    const existingDevice = await prisma.devices.findFirst({
      where: {
        id: device.id,
        user_id: user.id,
      },
    })

    if (!existingDevice) {
      res.status(404).json({ message: "Device not found" })
      return
    }

    const updated = await prisma.devices.update({
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
  res: Response
): Promise<void> => {
  try {
    const user = req.user
    const { id } = req.params

    if (!id) {
      res.status(400).json({ message: "Id is missing" })
      return
    }

    const deleted = await prisma.devices.delete({
      where: {
        id: BigInt(id),
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
