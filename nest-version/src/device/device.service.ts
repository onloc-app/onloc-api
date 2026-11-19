import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common"
import { Device, User } from "@prisma/client"
import { PrismaService } from "../prisma/prisma.service.js"
import { QueueService } from "../common/modules/queue/queue.service.js"
import { UserTierService } from "../user-tier/user-tier.service.js"
import { PostDeviceRequestDto } from "./dtos/requests/post-device-request.dto.js"
import { PatchDeviceRequestDto } from "./dtos/requests/patch-device-request.dto.js"
import { PostLockDeviceRequestDto } from "./dtos/requests/post-lock-device-request.dto.js"
import { DeviceWithExtras } from "./types/DeviceWithExtras.js"
import { AccessService } from "../common/modules/access/access.service.js"
import { RealtimeService } from "../realtime/realtime.service.js"
import { RealtimeGateway } from "../realtime/realtime.gateway.js"

@Injectable()
export class DeviceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userTierService: UserTierService,
    private readonly queueService: QueueService,
    private readonly accessService: AccessService,
    private readonly realtimeService: RealtimeService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async create(user: User, data: PostDeviceRequestDto): Promise<Device> {
    const existingDevice = await this.prisma.device.findFirst({
      where: {
        user_id: user.id,
        name: data.name,
      },
    })
    if (existingDevice) {
      throw new BadRequestException("Device already exists")
    }

    if (!user.admin) {
      const deviceCount = await this.prisma.device.count({
        where: { user_id: user.id },
      })
      const permissions = await this.userTierService.checkPermissions(user.id)
      if (permissions.maxDevices !== null) {
        if (deviceCount >= permissions.maxDevices) {
          throw new ForbiddenException(
            "Max devices allowed for this account reached",
          )
        }
      }
    }

    return await this.prisma.device.create({
      data: {
        user_id: user.id,
        name: data.name,
        color: data.color ?? null,
        icon: data.icon ?? null,
        can_ring: data.can_ring ?? false,
        can_lock: data.can_lock ?? false,
        can_flash: data.can_flash ?? false,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })
  }

  async findAll(userId: bigint): Promise<DeviceWithExtras[]> {
    const rawDevices = await this.prisma.device.findMany({
      where: { user_id: userId },
    })

    return await Promise.all(
      rawDevices.map(async (device) => {
        const latestLocation = await this.prisma.location.findFirst({
          where: { device_id: device.id },
          orderBy: { created_at: "desc" },
        })
        const isConnected = await this.checkConnection(device.id)

        return {
          ...device,
          latest_location: latestLocation ? latestLocation : null,
          is_connected: isConnected,
        }
      }),
    )
  }

  async findShared(userId: bigint): Promise<DeviceWithExtras[]> {
    const connections = await this.prisma.connection.findMany({
      where: {
        OR: [{ requester_id: userId }, { addressee_id: userId }],
        status: "ACCEPTED",
      },
      include: {
        deviceShares: {
          include: {
            device: true,
          },
        },
      },
    })

    const rawDeviceShares = connections
      .flatMap((connection) => connection.deviceShares)
      .filter((share) => share.device.user_id !== userId)

    return await Promise.all(
      rawDeviceShares.map(async (deviceShare) => {
        const device = deviceShare.device
        const latestLocation = await this.prisma.location.findFirst({
          where: { device_id: device.id },
          orderBy: { created_at: "desc" },
        })
        const isConnected = await this.checkConnection(device.id)

        const overriddenDevice: Device = {
          ...device,
          can_ring: deviceShare.can_ring,
          can_lock: deviceShare.can_lock,
          can_flash: deviceShare.can_flash,
        }

        return {
          ...overriddenDevice,
          latest_location: latestLocation ? latestLocation : null,
          device_share: deviceShare,
          is_connected: isConnected,
        }
      }),
    )
  }

  async findOne(userId: bigint, id: bigint): Promise<DeviceWithExtras> {
    const hasAccess = await this.accessService.hasReadAccessToDevice(userId, id)
    if (!hasAccess) {
      throw new ForbiddenException()
    }

    const device = await this.prisma.device.findFirst({
      where: { id },
    })
    if (!device) {
      throw new NotFoundException("Device not found")
    }

    const latestLocation = await this.prisma.location.findFirst({
      where: { device_id: device.id },
      orderBy: { created_at: "desc" },
    })
    const isConnected = await this.checkConnection(device.id)

    return {
      ...device,
      latest_location: latestLocation,
      is_connected: isConnected,
    }
  }

  async update(userId: bigint, data: PatchDeviceRequestDto): Promise<Device> {
    const id = BigInt(data.id)
    const existing = await this.prisma.device.findFirst({
      where: {
        id,
        user_id: userId,
      },
    })
    if (!existing) {
      throw new NotFoundException("Device not found")
    }

    const updateData: Partial<Device> = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.color !== undefined) updateData.color = data.color
    if (data.icon !== undefined) updateData.icon = data.icon
    if (data.can_ring !== undefined) updateData.can_ring = data.can_ring
    if (data.can_lock !== undefined) updateData.can_lock = data.can_lock
    if (data.can_flash !== undefined) updateData.can_flash = data.can_flash

    return await this.prisma.device.update({
      where: { id: id },
      data: updateData,
    })
  }

  async remove(userId: bigint, id: bigint): Promise<void> {
    const existing = await this.prisma.device.findFirst({
      where: {
        id: id,
        user_id: userId,
      },
    })
    if (!existing) {
      throw new NotFoundException("Device not found")
    }

    await this.prisma.device.delete({
      where: { id },
    })
  }

  async ring(userId: bigint, id: bigint): Promise<{ queued: boolean }> {
    const hasAccess = await this.accessService.hasRingAccessToDevice(userId, id)
    if (!hasAccess) {
      throw new ForbiddenException("Not authorized to ring this device")
    }

    const device = await this.prisma.device.findUnique({ where: { id } })
    if (!device) {
      throw new NotFoundException("Device not found")
    }
    if (!device.can_ring) {
      throw new ForbiddenException("Device cannot be rung")
    }

    if (await this.shouldQueueCommand(id)) {
      this.queueService.ringQueue.add(id)
      return { queued: true }
    }

    await this.realtimeService.emitRingCommand(id)
    return { queued: false }
  }

  async lock(
    userId: bigint,
    id: bigint,
    data?: PostLockDeviceRequestDto,
  ): Promise<{ queued: boolean }> {
    const hasAccess = await this.accessService.hasLockAccessToDevice(userId, id)
    if (!hasAccess) {
      throw new ForbiddenException("Not authorized to lock this device")
    }

    const device = await this.prisma.device.findUnique({ where: { id } })
    if (!device) {
      throw new NotFoundException("Device not found")
    }
    if (!device.can_lock) {
      throw new ForbiddenException("Device cannot be locked")
    }

    if (await this.shouldQueueCommand(id)) {
      this.queueService.lockQueue.add(id, data?.message ?? null)
      return { queued: true }
    }

    await this.realtimeService.emitLockCommand(id, data?.message)
    return { queued: false }
  }

  async flash(userId: bigint, id: bigint): Promise<{ queued: boolean }> {
    const hasAccess = await this.accessService.hasFlashAccessToDevice(
      userId,
      id,
    )
    if (!hasAccess) {
      throw new ForbiddenException("Not authorized to flash this device")
    }

    const device = await this.prisma.device.findUnique({ where: { id } })
    if (!device) {
      throw new NotFoundException("Device not found")
    }
    if (!device.can_flash) {
      throw new ForbiddenException("Device cannot flash")
    }

    if (await this.shouldQueueCommand(id)) {
      this.queueService.flashQueue.add(id)
      return { queued: true }
    }

    await this.realtimeService.emitFlashCommand(id)
    return { queued: false }
  }

  async checkConnection(id: bigint): Promise<boolean> {
    return await this.realtimeGateway.hasDeviceConnection(id)
  }

  private async shouldQueueCommand(deviceId: bigint): Promise<boolean> {
    const pushProviders = await this.prisma.unifiedPushProvider.findFirst({
      where: { device_id: deviceId },
    })
    const isConnected = await this.checkConnection(deviceId)
    return !isConnected && !pushProviders
  }
}
