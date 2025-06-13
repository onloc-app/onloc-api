import type { Response } from "express"
import { PrismaClient, type locations } from "../generated/prisma"
import type { AuthenticatedRequest } from "../middlewares/auth"
import { sanitizeObject } from "../utils"

const prisma = new PrismaClient()

export const createLocation = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user
    const location: locations = req.body
    const device = await prisma.devices.findFirst({
      where: {
        id: location.device_id,
      },
    })

    if (!device) {
      res.status(400).json({ message: "Device does not exist" })
      return
    }

    if (device?.user_id !== user.id) {
      res.status(403).json({ message: "Forbidden" })
      return
    }

    const newLocation = await prisma.locations.create({
      data: {
        device_id: location.device_id,
        accuracy: location.accuracy,
        altitude: location.altitude,
        altitude_accuracy: location.altitude_accuracy,
        latitude: location.latitude,
        longitude: location.longitude,
        battery: location.battery,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

    res.status(201).json({ location: sanitizeObject(newLocation) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not create location" })
  }
}

export const readLocations = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user
    const { device_id, start_date, end_date, latest } = req.query

    const deviceWhere = {
      user_id: user.id,
      ...(device_id ? { id: Number(device_id) } : {}),
    }

    const devices = await prisma.devices.findMany({
      where: deviceWhere,
      select: { id: true },
    })

    if (!devices.length) {
      res.status(404).json({ message: "Device not found" })
      return
    }

    const deviceIds = devices.map((device) => device.id)
    const dateRange = {
      ...(start_date ? { gte: new Date(start_date.toString()) } : {}),
      ...(end_date ? { lte: new Date(end_date.toString()) } : {}),
    }

    const fetchLocations = async (id: BigInt) => {
      const where = {
        device_id: Number(id),
        ...(start_date || end_date ? { created_at: dateRange } : {}),
      }

      if (latest === "true") {
        const location = await prisma.locations.findFirst({
          where,
          orderBy: { created_at: "desc" },
        })
        return { device_id: id, locations: location ? [location] : [] }
      }

      const locations = await prisma.locations.findMany({
        where,
        orderBy: { created_at: "desc" },
      })
      return { device_id: id, locations: locations }
    }

    const results = await Promise.all(deviceIds.map(fetchLocations))
    res.status(200).json({ locations: sanitizeObject(results) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not read locations" })
  }
}

export const readLocation = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params

    if (!id) throw new Error("Id is missing")

    const location = await prisma.locations.findFirst({
      where: {
        id: BigInt(id),
      },
    })

    if (!location) {
      res.status(404).json({ message: "Location not found" })
      return
    }

    res.status(200).json({ location: sanitizeObject(location) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not read location" })
  }
}

export const updateLocation = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user
    const location: locations = req.body
    const device = await prisma.devices.findFirst({
      where: {
        id: location.device_id,
      },
    })

    if (!device) {
      res.status(400).json({ message: "Device does not exist" })
      return
    }

    if (device?.user_id !== user.id) {
      res.status(403).json({ message: "Forbidden" })
      return
    }

    const existingLocation = await prisma.locations.findFirst({
      where: {
        id: BigInt(location.id),
      },
    })

    if (!existingLocation) {
      res.status(404).json({ message: "Location not found" })
    }

    const updatedLocation = await prisma.locations.update({
      where: { id: location.id },
      data: location,
    })

    res.status(200).json({ location: sanitizeObject(location) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not update location" })
  }
}

export const deleteLocation = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user
    const { id } = req.params

    if (!id) throw new Error("Id is missing")

    const location = await prisma.locations.findFirst({
      where: {
        id: BigInt(id),
      },
    })

    if (!location) {
      res.status(404).json({ message: "Location not found" })
      return
    }

    const device = await prisma.devices.findFirst({
      where: {
        id: location.device_id,
      },
    })

    if (!device || device.user_id !== user.id) {
      res.status(403).json({ message: "Forbidden" })
      return
    }

    await prisma.locations.delete({
      where: {
        id: BigInt(id),
      },
    })

    res.status(204).send()
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not delete location" })
  }
}
