import type { Device, User } from "../generated/prisma"
import {
  sendCommandToDeviceByPush,
  sendCommandToUserByPush,
} from "../helpers/push"
import prisma from "../prisma"
import { getIO } from "../socket"
import { CONNECTIONS_CHANGE } from "../types/Consts"

export class NotificationService {
  private io

  constructor() {
    this.io = getIO()
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
