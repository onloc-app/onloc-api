import type { Device } from "../generated/prisma"
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
    }
  }
}
