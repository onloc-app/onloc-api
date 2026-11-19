import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common"
import { Location, User } from "@prisma/client"
import { PrismaService } from "../prisma/prisma.service.js"
import { PostLocationRequestDto } from "./dtos/requests/post-location-request.dto.js"
import { PostLocationsRequestDto } from "./dtos/requests/post-locations-request.dto.js"
import { AccessService } from "../common/modules/access/access.service.js"
import { RealtimeService } from "../realtime/realtime.service.js"

@Injectable()
export class LocationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessService: AccessService,
    private readonly realtimeService: RealtimeService,
  ) {}

  async create(
    userId: bigint,
    data: PostLocationRequestDto,
  ): Promise<Location> {
    const device = await this.prisma.device.findUnique({
      where: { id: BigInt(data.device_id), user_id: userId },
    })
    if (!device) {
      throw new NotFoundException("Device not found")
    }

    const created = await this.prisma.location.create({
      data: {
        device_id: BigInt(data.device_id),
        accuracy: data.accuracy,
        altitude: data.altitude,
        altitude_accuracy: data.altitude_accuracy,
        latitude: data.latitude,
        longitude: data.longitude,
        bearing: data.bearing,
        bearing_accuracy_degrees: data.bearing_accuracy_degrees,
        speed: data.speed,
        speed_accuracy: data.speed_accuracy,
        provider: data.provider,
        battery: data.battery,
        charging: data.charging,
        created_at: data.created_at ?? new Date(),
        updated_at: new Date(),
      },
    })

    await this.realtimeService.emitLocationsChange("create", [created])

    return created
  }

  async createBatch(
    userId: bigint,
    data: PostLocationsRequestDto,
  ): Promise<Location[]> {
    const deviceIds = [
      ...new Set(data.locations.map((l) => BigInt(l.device_id))),
    ]
    const devices = await this.prisma.device.findMany({
      where: { id: { in: deviceIds }, user_id: userId },
    })

    if (devices.length !== deviceIds.length) {
      throw new NotFoundException("Device not found")
    }

    const created: Location[] = await this.prisma.location.createManyAndReturn({
      data: data.locations.map((l) => ({
        device_id: BigInt(l.device_id),
        accuracy: l.accuracy,
        altitude: l.altitude,
        altitude_accuracy: l.altitude_accuracy,
        latitude: l.latitude,
        longitude: l.longitude,
        bearing: l.bearing,
        bearing_accuracy_degrees: l.bearing_accuracy_degrees,
        speed: l.speed,
        speed_accuracy: l.speed_accuracy,
        provider: l.provider,
        battery: l.battery,
        charging: l.charging,
        created_at: l.created_at ?? new Date(),
        updated_at: new Date(),
      })),
    })

    await this.realtimeService.emitLocationsChange("create", created)

    return created
  }

  async findAll(
    userId: bigint,
    deviceId?: bigint,
    startDate?: Date,
    endDate?: Date,
    latest?: boolean,
  ): Promise<Location[]> {
    if (
      deviceId &&
      !(await this.accessService.hasReadAccessToDevice(userId, deviceId))
    ) {
      throw new ForbiddenException()
    }

    const dateRange = this.generateDateRange(startDate, endDate)

    if (latest === true) {
      const devices = await this.prisma.device.findMany({
        where: deviceId ? { id: deviceId } : { user_id: userId },
      })
      const locations: Location[] = []
      await Promise.all(
        devices.map(async (device) => {
          const location = await this.prisma.location.findFirst({
            where: {
              device_id: device.id,
              ...(dateRange ? { created_at: dateRange } : {}),
            },
            orderBy: { created_at: "desc" },
          })
          if (location) locations.push(location)
        }),
      )
      if (!locations) {
        throw new NotFoundException("Locations not found")
      }
      return locations
    }

    const locations = await this.prisma.location.findMany({
      where: {
        ...(deviceId
          ? { device_id: deviceId }
          : { device: { user_id: userId } }),
        ...(dateRange ? { created_at: dateRange } : {}),
      },
      orderBy: { created_at: "asc" },
    })
    if (!locations) {
      throw new NotFoundException("Locations not found")
    }

    return Array.isArray(locations) ? locations : [locations]
  }

  async findOne(userId: bigint, id: bigint): Promise<Location> {
    const location = await this.prisma.location.findUnique({
      where: {
        id: id,
        device: {
          user_id: userId,
        },
      },
    })
    if (!location) {
      throw new NotFoundException("Location not found")
    }
    return location
  }

  async findOneAvailableDates(
    userId: bigint,
    deviceId: bigint,
  ): Promise<string[]> {
    if (!(await this.accessService.hasReadAccessToDevice(userId, deviceId))) {
      throw new ForbiddenException()
    }

    const locations = await this.prisma.location.findMany({
      where: {
        device_id: deviceId,
      },
      select: {
        created_at: true,
      },
    })

    const dateSet = new Set<string>()
    for (const { created_at } of locations) {
      const dateOnly = created_at.toISOString().split("T")[0]!
      dateSet.add(dateOnly)
    }

    return Array.from(dateSet)
  }

  async deleteAll(user: User, aimedUserId: bigint): Promise<void> {
    if (!user.admin && user.id !== aimedUserId) {
      throw new ForbiddenException()
    }

    const deleted = await this.prisma.location.findMany({
      where: {
        device: {
          user_id: aimedUserId,
        },
      },
    })

    await this.prisma.location.deleteMany({
      where: {
        device: {
          user_id: aimedUserId,
        },
      },
    })

    await this.realtimeService.emitLocationsChange("delete", deleted)
  }

  async delete(userId: bigint, id: bigint): Promise<void> {
    await this.findOne(userId, id)
    const deleted = await this.prisma.location.delete({
      where: { id: id, device: { user_id: userId } },
    })

    await this.realtimeService.emitLocationsChange("delete", [deleted])
  }

  private generateDateRange(
    startDate?: Date,
    endDate?: Date,
  ): { lte?: Date; gte?: Date } | null {
    const from = startDate
    const to = endDate

    if (!from && !to) return null

    const dateRange = {
      ...(from ? { gte: from } : {}),
      ...(to ? { lte: to } : {}),
    }

    return dateRange
  }
}
