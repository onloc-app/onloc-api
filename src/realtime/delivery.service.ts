import { Injectable, Logger } from "@nestjs/common"
import { Server } from "socket.io"
import webpush, { WebPushError } from "web-push"
import { PrismaService } from "../prisma/prisma.service.js"
import { UnifiedPushProvider } from "@prisma/client"
import { Event } from "../common/enums/event.js"

type Payload = Record<string, unknown>

@Injectable()
export class DeliveryService {
  private server: Server | null = null
  private logger: Logger

  constructor(private readonly prisma: PrismaService) {
    this.logger = new Logger(DeliveryService.name)
  }

  attachServer(server: Server): void {
    this.server = server
  }

  async emitToUser(
    userId: bigint,
    event: Event,
    payload?: Payload,
  ): Promise<void> {
    this.emitToUserBySocket(userId, event, payload)
    await this.emitToUserByPush(userId, event, payload)
  }

  async emitToDevice(
    deviceId: bigint,
    event: Event,
    payload?: Payload,
  ): Promise<void> {
    this.emitToDeviceBySocket(deviceId, event, payload)
    await this.emitToDeviceByPush(deviceId, event, payload)
  }

  async emitToAdmin(event: Event, payload?: Payload): Promise<void> {
    this.emitToAdminBySocket(event, payload)
    await this.emitToAdminByPush(event, payload)
  }

  private emitToUserBySocket(
    userId: bigint,
    event: Event,
    payload?: Payload,
  ): void {
    this.emitBySocket(`user-${userId}`, event, payload)
  }

  private emitToAdminBySocket(event: Event, payload?: Payload): void {
    this.emitBySocket("admin", event, payload)
  }

  private emitToDeviceBySocket(
    deviceId: bigint,
    event: Event,
    payload?: Payload,
  ): void {
    this.emitBySocket(`device-${deviceId}`, event, payload)
  }

  private emitBySocket(
    roomName: string,
    event: Event,
    payload?: Payload,
  ): void {
    const room = this.server?.to(roomName)
    if (!room) return

    if (payload === undefined) room.emit(event)
    else room.emit(event, payload)
  }

  private async emitToUserByPush(
    userId: bigint,
    event: Event,
    payload?: Payload,
  ): Promise<void> {
    const providers = await this.prisma.unifiedPushProvider.findMany({
      where: { user_id: userId },
    })
    await Promise.all(
      providers.map((provider) => this.emitByPush(provider, event, payload)),
    )
  }

  private async emitToDeviceByPush(
    deviceId: bigint,
    event: Event,
    payload?: Payload,
  ): Promise<void> {
    const providers = await this.prisma.unifiedPushProvider.findMany({
      where: { device_id: deviceId },
    })
    await Promise.all(
      providers.map((provider) => this.emitByPush(provider, event, payload)),
    )
  }

  private async emitToAdminByPush(
    event: Event,
    payload?: Payload,
  ): Promise<void> {
    const providers = await this.prisma.unifiedPushProvider.findMany({
      where: { user: { admin: true } },
    })
    await Promise.all(
      providers.map((provider) => this.emitByPush(provider, event, payload)),
    )
  }

  private async emitByPush(
    provider: UnifiedPushProvider,
    event: Event,
    payload?: Payload,
  ): Promise<void> {
    try {
      const data = JSON.stringify({ command: event, ...payload })

      if (!provider.pub_key || !provider.auth) {
        const response = await fetch(provider.endpoint_url, {
          method: "POST",
          headers: { "Content-Type": "text/plain" },
          body: data,
        })
        if (!response.ok) {
          throw new Error(response.status.toString())
        }
      } else {
        try {
          await webpush.sendNotification(
            {
              endpoint: provider.endpoint_url,
              keys: { p256dh: provider.pub_key, auth: provider.auth },
            },
            data,
          )
        } catch (error) {
          if (error instanceof WebPushError) {
            throw new Error(error.statusCode.toString(), { cause: error })
          }
        }
      }
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message === "404" || error.message === "410")
      ) {
        await this.deleteExpiredProvider(provider.id)
      }
      this.logger.error(error)
    }
  }

  private async deleteExpiredProvider(id: bigint): Promise<void> {
    await this.prisma.unifiedPushProvider.deleteMany({ where: { id: id } })
  }
}
