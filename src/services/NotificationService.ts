import type { Device, Location, User } from "../generated/prisma"
import {
  sendCommandToDeviceByPush,
  sendCommandToUserByPush,
} from "../helpers/push"
import prisma from "../prisma"
import { getIO } from "../socket"
import type { CrudAction } from "../types"
import {
  ADMIN_LOCATIONS_CHANGE,
  CONNECTIONS_CHANGE,
  LOCATIONS_CHANGE,
} from "../types/Consts"

export class NotificationService {
  private io

  constructor() {
    this.io = getIO()
  }

  async emitLocationsChange(action: CrudAction, locations: Location[]) {
    const userId = (
      await prisma.device.findFirst({
        where: { id: locations[0]?.device_id },
        select: { user_id: true },
      })
    )?.user_id

    if (!userId) return

    const data = {
      action: action,
      locations: locations,
    }

    for (const location of locations) {
      const deviceShares = await prisma.deviceShare.findMany({
        where: { device_id: location.device_id },
      })
      deviceShares.forEach((ds) => {
        this.io.to(`user-${ds.user_id.toString()}`).emit(LOCATIONS_CHANGE, data)
      })
    }

    this.io.to(`user-${userId.toString()}`).emit(LOCATIONS_CHANGE, data)
    this.io.to("admin").emit(ADMIN_LOCATIONS_CHANGE, data)
  }

  async emitConnectionChange(device: Device) {
    const shares = await prisma.deviceShare.findMany({
      where: { device_id: device.id },
    })
    const userIds = new Set([
      device.user_id,
      ...shares.map(({ user_id }) => user_id),
    ])

    for (const userId of userIds) {
      this.io.to(`user-${userId}`).emit(CONNECTIONS_CHANGE)
      sendCommandToUserByPush(userId, CONNECTIONS_CHANGE)
    }
  }

  async emitUserWatching(user: User, isWatching: boolean) {
    const shares = await prisma.deviceShare.findMany({
      where: { user_id: user.id },
    })
    const ownedDevices = await prisma.device.findMany({
      where: { user_id: user.id },
    })
    const deviceIds = new Set([
      ...ownedDevices.map(({ id }) => id),
      ...shares.map(({ device_id }) => device_id),
    ])

    for (const deviceId of deviceIds) {
      this.io
        .to(`device-${deviceId}`)
        .emit("user-watching", { is_watching: isWatching })
      sendCommandToDeviceByPush(deviceId, "user-watching", {
        is_watching: isWatching,
      })
    }
  }
}
