import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common"
import { PostDeviceShareRequestDto } from "./dtos/requests/post-device-share-request.dto.js"
import { ConnectionStatus, DeviceShare } from "@prisma/client"
import { PrismaService } from "../prisma/prisma.service.js"
import { DeviceShareWithDevice } from "./types/DeviceShareWithDevice.js"

@Injectable()
export class DeviceShareService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: bigint,
    data: PostDeviceShareRequestDto,
  ): Promise<DeviceShare> {
    const existing = await this.prisma.deviceShare.findFirst({
      where: {
        device_id: BigInt(data.device_id),
        connection_id: BigInt(data.connection_id),
      },
    })

    if (existing) {
      throw new BadRequestException("Device share already exists")
    }

    const connection = await this.prisma.connection.findFirst({
      where: {
        id: BigInt(data.connection_id),
        OR: [{ requester_id: userId }, { addressee_id: userId }],
      },
    })

    if (!connection) {
      throw new NotFoundException("Connection not found")
    }

    if (connection.status !== ConnectionStatus.ACCEPTED) {
      throw new ForbiddenException()
    }

    const device = await this.prisma.device.findUnique({
      where: {
        id: BigInt(data.device_id),
        user_id: userId,
      },
    })

    if (!device) {
      throw new NotFoundException("Device not found")
    }

    const otherUserId =
      connection.addressee_id !== userId
        ? connection.addressee_id
        : connection.requester_id

    const created = await this.prisma.deviceShare.create({
      data: {
        user_id: otherUserId,
        device_id: device.id,
        connection_id: connection.id,
        can_ring: data.can_ring,
        can_lock: data.can_lock,
        can_flash: data.can_flash,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

    return created
  }

  async findAll(userId: bigint): Promise<DeviceShareWithDevice[]> {
    const deviceShares = await this.prisma.deviceShare.findMany({
      where: {
        connection: {
          OR: [{ requester_id: userId }, { addressee_id: userId }],
        },
      },
      include: {
        device: true,
      },
    })
    return deviceShares
  }

  async remove(userId: bigint, id: bigint): Promise<void> {
    const deviceShare = await this.prisma.deviceShare.findUnique({
      where: { id: id, user_id: userId },
    })
    if (!deviceShare) throw new NotFoundException("Device share not found")
    await this.prisma.deviceShare.delete({
      where: { id: id, user_id: userId },
    })
  }
}
