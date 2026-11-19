import { Logger } from "@nestjs/common"
import { WsAuthenticator } from "@nestjs/authentication"
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets"
import type { User } from "@prisma/client"
import type { Server, Socket } from "socket.io"
import { PrismaService } from "../prisma/prisma.service.js"
import { Event } from "../common/enums/event.js"
import { RealtimeService } from "./realtime.service.js"
import { DeliveryService } from "./delivery.service.js"

@WebSocketGateway({ path: "/ws", cors: { origin: "*" } })
export class RealtimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(RealtimeGateway.name)

  @WebSocketServer()
  server: Server

  constructor(
    private readonly authenticator: WsAuthenticator,
    private readonly prisma: PrismaService,
    private readonly realtimeService: RealtimeService,
    private readonly deliveryService: DeliveryService,
  ) {}

  afterInit(server: Server): void {
    this.deliveryService.attachServer(server)
  }

  async handleConnection(client: Socket): Promise<void> {
    const authentication = await this.authenticator.authenticateConnection(
      client,
      client.request,
    )
    if (!authentication) return

    const user = authentication.user as User
    client.data.user = user
    await client.join(`user-${user.id}`)
    if (user.admin) await client.join("admin")

    await this.realtimeService.emitUserWatching(
      user.id,
      await this.hasUserConnection(user.id),
    )
  }

  async handleDisconnect(client: Socket): Promise<void> {
    const user = client.data.user as User | undefined
    if (!user) return

    await this.realtimeService.emitUserWatching(
      user.id,
      await this.hasUserConnection(user.id),
    )
  }

  @SubscribeMessage(Event.REGISTER_DEVICE)
  async registerDevice(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: unknown,
  ): Promise<void> {
    const deviceId = this.parseDeviceId(body)
    if (deviceId === null) {
      client.emit("error", "Invalid device_id")
      return
    }

    const user = client.data.user as User
    const device = await this.prisma.device.findUnique({
      where: { id: deviceId },
    })
    if (!device) {
      client.emit("error", "Device not found")
      return
    }
    if (device.user_id !== user.id) {
      client.emit("error", "Forbidden")
      return
    }

    await client.join(`device-${deviceId}`)
    await this.realtimeService.emitConnectionChange(device)

    await this.realtimeService.sendQueuedCommands(deviceId)
  }

  @SubscribeMessage(Event.UNREGISTER_DEVICE)
  async unregisterDevice(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: unknown,
  ): Promise<void> {
    const deviceId = this.parseDeviceId(body)
    if (deviceId === null) {
      client.emit("error", "Invalid device_id")
      return
    }

    const device = await this.prisma.device.findUnique({
      where: { id: deviceId },
    })
    if (!device) {
      client.emit("error", "Device not found")
      return
    }

    const room = `device-${deviceId}`
    if (!client.rooms.has(room)) return

    await client.leave(room)
    await this.realtimeService.emitConnectionChange(device)
  }

  async hasDeviceConnection(deviceId: bigint): Promise<boolean> {
    if (!this.server) return false
    const sockets = await this.server.in(`device-${deviceId}`).fetchSockets()
    return sockets.length > 0
  }

  async hasUserConnection(userId: bigint): Promise<boolean> {
    if (!this.server) return false
    const sockets = await this.server.in(`user-${userId}`).fetchSockets()
    return sockets.length > 0
  }

  private parseDeviceId(body: unknown): bigint | null {
    if (typeof body !== "object" || body === null || !("device_id" in body)) {
      return null
    }

    const value = body.device_id
    if (typeof value === "number" && !Number.isSafeInteger(value)) return null
    if (typeof value !== "string" && typeof value !== "number") return null

    const text = String(value)
    if (!/^\d+$/.test(text)) return null

    try {
      return BigInt(text)
    } catch {
      return null
    }
  }
}
