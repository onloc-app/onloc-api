import { Injectable } from "@nestjs/common"
import { DeviceShare } from "@prisma/client"
import { PrismaService } from "../../../prisma/prisma.service.js"

@Injectable()
export class AccessService {
  constructor(private readonly prisma: PrismaService) {}

  private async ownsDevice(userId: bigint, deviceId: bigint): Promise<boolean> {
    const ownedDevice = await this.prisma.device.findUnique({
      where: {
        id: deviceId,
        user_id: userId,
      },
    })

    if (ownedDevice) return true
    else return false
  }

  private async grabDeviceShare(
    userId: bigint,
    deviceId: bigint,
  ): Promise<DeviceShare | null> {
    const deviceShare = await this.prisma.deviceShare.findFirst({
      where: {
        device_id: deviceId,
        connection: {
          OR: [{ requester_id: userId }, { addressee_id: userId }],
        },
      },
    })
    return deviceShare
  }

  async hasReadAccessToDevice(
    userId: bigint,
    deviceId: bigint,
  ): Promise<boolean> {
    if (await this.ownsDevice(userId, deviceId)) return true
    const deviceShare = await this.grabDeviceShare(userId, deviceId)
    return !!deviceShare
  }

  async hasRingAccessToDevice(
    userId: bigint,
    deviceId: bigint,
  ): Promise<boolean> {
    if (await this.ownsDevice(userId, deviceId)) return true
    const deviceShare = await this.grabDeviceShare(userId, deviceId)
    return !!deviceShare?.can_ring
  }

  async hasLockAccessToDevice(
    userId: bigint,
    deviceId: bigint,
  ): Promise<boolean> {
    if (await this.ownsDevice(userId, deviceId)) return true
    const deviceShare = await this.grabDeviceShare(userId, deviceId)
    return !!deviceShare?.can_lock
  }

  async hasFlashAccessToDevice(
    userId: bigint,
    deviceId: bigint,
  ): Promise<boolean> {
    if (await this.ownsDevice(userId, deviceId)) return true
    const deviceShare = await this.grabDeviceShare(userId, deviceId)
    return !!deviceShare?.can_flash
  }
}
