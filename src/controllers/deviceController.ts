import type { Response } from "express"
import { PrismaClient, type devices } from "../generated/prisma"
import type { AuthenticatedRequest } from "../middlewares/auth"
import { sanitizeObject } from "../utils"

const prisma = new PrismaClient()

export const createDevice = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user
    const device: devices = req.body

    if (user.id !== device.user_id) {
      res.status(403).json({ message: "Forbidden" })
      return
    }

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

    res.status(201).json({ device: sanitizeObject(newDevice) })
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

    const devices = await prisma.devices.findMany({
      where: {
        user_id: user.id,
      },
    })

    res.status(200).json({ devices: sanitizeObject(devices) })
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

    const device = await prisma.devices.findFirst({
      where: {
        id: BigInt(id),
      },
    })

    if (!device) {
      res.status(404).json({ message: "Device not found" })
      return
    }

    if (user.id !== device.user_id) {
      res.status(403).json({ message: "Forbidden" })
      return
    }

    res.status(200).json({ device: sanitizeObject(device) })
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

    const updatedDevice = await prisma.devices.update({
      where: {
        id: device.id,
        user_id: user.id,
      },
      data: device,
    })

    res.status(200).json({ device: sanitizeObject(updatedDevice) })
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

    const deletedDevice = await prisma.devices.delete({
      where: {
        id: BigInt(id),
        user_id: user.id,
      },
    })

    if (!deletedDevice) {
      res.status(404).json({ message: "Device not found" })
      return
    }

    res.status(204).send()
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not delete device" })
  }
}
