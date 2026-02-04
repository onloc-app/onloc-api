import type { Response } from "express"
import { type Location } from "../generated/prisma"
import type { AuthenticatedRequest } from "../middlewares/auth"
import prisma from "../prisma"
import { getIO } from "../socket"
import type { CrudAction } from "../types"
import { sanitizeData } from "../utils"
import { hasSoftAccessToDevice } from "./deviceController"
import ApiError from "../types/ApiError"

function emitAction(
  userId: bigint,
  action: CrudAction,
  locations: Location[],
): void {
  const io = getIO()

  const data = {
    action: action,
    locations: locations,
  }

  io.to(`user_${userId.toString()}`).emit("locations-change", data)
  io.to(`admin`).emit("admin-locations-change", data)
}

export const createLocation = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user!
    const location: Location = req.body

    const device = await prisma.device.findFirst({
      where: {
        id: location.device_id,
      },
    })

    if (!device) {
      res.status(404).json({ message: "Device not found" })
      return
    }

    if (device?.user_id !== user.id) {
      res.status(403).json({ message: "Forbidden" })
      return
    }

    const newLocation = await prisma.location.create({
      data: {
        device_id: location.device_id,
        accuracy: location.accuracy,
        altitude: location.altitude,
        altitude_accuracy: location.altitude_accuracy,
        latitude: location.latitude,
        longitude: location.longitude,
        battery:
          location.battery != null &&
          location.battery > 0 &&
          location.battery <= 100
            ? location.battery
            : undefined,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

    emitAction(user.id, "create", [sanitizeData(newLocation)])

    res.status(201).json({ location: sanitizeData(newLocation) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not create location" })
  }
}

export const readLocations = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user!
    const { device_id, start_date, end_date, latest } = req.query

    let results

    if (device_id) {
      results = await getLocationsForDevice(
        BigInt(device_id as string),
        user.id,
        start_date?.toString(),
        end_date?.toString(),
        latest?.toString(),
      )
    } else {
      results = await getLocationsForOwnedDevices(
        user.id,
        start_date?.toString(),
        end_date?.toString(),
        latest?.toString(),
      )
    }

    res.status(200).json({ locations: sanitizeData(results) })
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.status).json({ message: error.message })
      return
    }
    console.error(error)
    res.status(500).json({ message: "Could not read locations" })
  }
}

export const readLocation = async (
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

    const location = await prisma.location.findFirst({
      where: {
        id: BigInt(id as string),
        device: {
          user_id: user.id,
        },
      },
    })

    if (!location) {
      res.status(404).json({ message: "Location not found" })
      return
    }

    res.status(200).json({ location: sanitizeData(location) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not read location" })
  }
}

export const updateLocation = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user!
    const location: Location = req.body

    const existingLocation = await prisma.location.findFirst({
      where: {
        id: BigInt(location.id),
        device: {
          user_id: user.id,
        },
      },
    })

    if (!existingLocation) {
      res.status(404).json({ message: "Location not found" })
      return
    }

    const updatedLocation = await prisma.location.update({
      where: { id: location.id },
      data: {
        ...location,
        updated_at: new Date(),
      },
    })

    emitAction(user.id, "update", [sanitizeData(updatedLocation)])

    res.status(200).json({ location: sanitizeData(updatedLocation) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not update location" })
  }
}

export const deleteLocation = async (
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

    const deletedLocation = await prisma.location.delete({
      where: {
        id: BigInt(id as string),
        device: { user_id: user.id },
      },
    })

    if (!deletedLocation) {
      res.status(404).json({ message: "Location not found" })
      return
    }

    emitAction(user.id, "delete", [sanitizeData(deletedLocation)])

    res.status(204).send()
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not delete location" })
  }
}

export const deleteLocations = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const reqUser = req.user!
    const { user_id } = req.query

    if (!user_id) {
      res.status(400).json({ message: "User id is missing" })
      return
    }

    const formattedUserId = BigInt(user_id.toString())

    if (!reqUser.admin && reqUser.id !== formattedUserId) {
      res.status(403).json({ message: "Forbidden" })
      return
    }

    const deletedLocations = await prisma.location.deleteMany({
      where: {
        device: {
          user_id: formattedUserId,
        },
      },
    })

    emitAction(formattedUserId, "delete", [sanitizeData(deletedLocations)])

    res.status(204).send()
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not delete locations" })
  }
}

export const availableDates = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user!
    const { device_id } = req.query

    if (!device_id) {
      res.status(400).json({ message: "A device id is required" })
      return
    }

    const formattedDeviceId = BigInt(device_id as string)

    if (!hasSoftAccessToDevice(formattedDeviceId, user.id)) {
      res.status(403).json({ message: "Forbidden" })
      return
    }

    const locations = await prisma.location.findMany({
      where: {
        device_id: formattedDeviceId,
      },
      select: {
        created_at: true,
      },
    })

    const dateSet = new Set<string>()

    for (const { created_at } of locations) {
      const dateOnly = created_at.toISOString().split("T")[0]
      dateSet.add(dateOnly!)
    }

    res.status(200).json({ dates: Array.from(dateSet) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not read available dates" })
  }
}

// Helper for readLocations when device_id exists
const getLocationsForDevice = async (
  deviceId: bigint,
  userId: bigint,
  startDate?: string,
  endDate?: string,
  latest?: string,
): Promise<{ device_id: bigint; locations: Location[] }[]> => {
  const hasAccess = await hasSoftAccessToDevice(deviceId, userId)
  if (!hasAccess) {
    throw new ApiError(403, "Forbidden")
  }

  const dateRange = {
    ...(startDate ? { gte: new Date(startDate) } : {}),
    ...(endDate ? { lte: new Date(endDate) } : {}),
  }

  const where = {
    device_id: deviceId,
    ...(startDate || endDate ? { created_at: dateRange } : {}),
  }

  if (latest === "true") {
    const location = await prisma.location.findFirst({
      where,
      orderBy: { created_at: "desc" },
    })
    return [{ device_id: deviceId, locations: location ? [location] : [] }]
  }

  const locations = await prisma.location.findMany({
    where,
    orderBy: { created_at: "asc" },
  })
  return [{ device_id: deviceId, locations }]
}

// Helper for readLocations, fetches every owned device
const getLocationsForOwnedDevices = async (
  userId: bigint,
  startDate?: string,
  endDate?: string,
  latest?: string,
): Promise<{ device_id: bigint; locations: Location[] }[]> => {
  const devices = await prisma.device.findMany({
    where: {
      user_id: userId,
    },
  })

  const deviceIds = devices.map((device) => device.id)

  const dateRange = {
    ...(startDate ? { gte: new Date(startDate) } : {}),
    ...(endDate ? { lte: new Date(endDate) } : {}),
  }

  const fetchLocations = async (id: bigint) => {
    const where = {
      device_id: id,
      ...(startDate || endDate ? { created_at: dateRange } : {}),
    }

    if (latest === "true") {
      const location = await prisma.location.findFirst({
        where,
        orderBy: { created_at: "desc" },
      })
      return { device_id: id, locations: location ? [location] : [] }
    }

    const locations = await prisma.location.findMany({
      where,
      orderBy: { created_at: "asc" },
    })
    return { device_id: id, locations }
  }

  return Promise.all(deviceIds.map(fetchLocations))
}
