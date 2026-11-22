import { Injectable, Logger } from "@nestjs/common"
import type { Device, Location } from "@prisma/client"
import { QueueService } from "../common/modules/queue/queue.service.js"
import { PrismaService } from "../prisma/prisma.service.js"
import { Event } from "../common/enums/event.js"
import { LocationDto } from "../device/dtos/location.dto.js"
import { DeliveryService } from "./delivery.service.js"

type CrudAction = "create" | "update" | "delete"

@Injectable()
export class RealtimeService {
  private readonly logger = new Logger(RealtimeService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly queueService: QueueService,
    private readonly deliveryService: DeliveryService,
  ) {}

  async sendQueuedCommands(deviceId: bigint): Promise<void> {
    if (this.queueService.ringQueue.has(deviceId)) {
      this.queueService.ringQueue.remove(deviceId)
      await this.emitRingCommand(deviceId)
      this.logger.log(`Sent queued ring to ${deviceId}`)
    }
    if (this.queueService.lockQueue.has(deviceId)) {
      const message = this.queueService.lockQueue.getMessage(deviceId)
      this.queueService.lockQueue.remove(deviceId)
      await this.emitLockCommand(deviceId, message)
      this.logger.log(`Sent queued lock to ${deviceId}`)
    }
    if (this.queueService.flashQueue.has(deviceId)) {
      this.queueService.flashQueue.remove(deviceId)
      await this.emitFlashCommand(deviceId)
      this.logger.log(`Sent queued flash to ${deviceId}`)
    }
  }

  async emitRingCommand(deviceId: bigint): Promise<void> {
    await this.deliveryService.emitToDevice(deviceId, Event.RING_COMMAND)
  }

  async emitLockCommand(
    deviceId: bigint,
    message?: string | null,
  ): Promise<void> {
    const payload = { message: message }
    await this.deliveryService.emitToDevice(
      deviceId,
      Event.LOCK_COMMAND,
      payload,
    )
  }

  async emitFlashCommand(deviceId: bigint): Promise<void> {
    await this.deliveryService.emitToDevice(deviceId, Event.FLASH_COMMAND)
  }

  async emitLocationsChange(
    action: CrudAction,
    locations: Location[],
  ): Promise<void> {
    const firstLocation = locations[0]
    if (!firstLocation) return

    const device = await this.prisma.device.findUnique({
      where: { id: firstLocation.device_id },
      select: { user_id: true },
    })
    if (!device) return

    const data = {
      action: action,
      locations: locations.map((location) => LocationDto.from(location)),
    }
    const userIds = new Set([device.user_id])

    for (const location of locations) {
      const shares = await this.prisma.deviceShare.findMany({
        where: { device_id: location.device_id },
        select: { user_id: true },
      })
      shares.forEach((share) => userIds.add(share.user_id))
    }

    for (const userId of userIds) {
      await this.deliveryService.emitToUser(
        userId,
        Event.LOCATIONS_CHANGE,
        data,
      )
    }
    await this.deliveryService.emitToAdmin(Event.ADMIN_LOCATIONS_CHANGE, data)
  }

  async emitConnectionChange(device: Device): Promise<void> {
    const shares = await this.prisma.deviceShare.findMany({
      where: { device_id: device.id },
      select: { user_id: true },
    })
    const userIds = new Set([
      device.user_id,
      ...shares.map((share) => share.user_id),
    ])

    for (const userId of userIds) {
      await this.deliveryService.emitToUser(userId, Event.CONNECTIONS_CHANGE)
    }
  }

  async emitUserWatching(userId: bigint, isWatching: boolean): Promise<void> {
    const [shares, ownedDevices] = await Promise.all([
      this.prisma.deviceShare.findMany({
        where: { user_id: userId },
        select: { device_id: true },
      }),
      this.prisma.device.findMany({
        where: { user_id: userId },
        select: { id: true },
      }),
    ])
    const deviceIds = new Set([
      ...ownedDevices.map((device) => device.id),
      ...shares.map((share) => share.device_id),
    ])

    for (const deviceId of deviceIds) {
      const payload = { is_watching: isWatching }
      await this.deliveryService.emitToDevice(
        deviceId,
        Event.USER_WATCHING,
        payload,
      )
    }
  }
}
