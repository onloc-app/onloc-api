import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common"
import { PostRegisterUnifiedPushRequestDto } from "./dto/requests/post-register-unified-push-request.dto.js"
import type { UnifiedPushProvider } from "@prisma/client"
import { PostUnregisterUnifiedPushRequestDto } from "./dto/requests/post-unregister-unified-push-request.dto.js"
import { PrismaService } from "../prisma/prisma.service.js"
import { RealtimeService } from "../realtime/realtime.service.js"

@Injectable()
export class UnifiedPushService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeService: RealtimeService,
  ) {}

  async create(
    userId: bigint,
    data: PostRegisterUnifiedPushRequestDto,
  ): Promise<UnifiedPushProvider> {
    const existing = await this.prisma.unifiedPushProvider.findUnique({
      where: {
        endpoint_url: data.endpoint_url,
      },
    })
    const finalDeviceId = data.device_id
      ? BigInt(data.device_id)
      : existing?.device_id

    const device = finalDeviceId
      ? await this.prisma.device.findUnique({ where: { id: finalDeviceId } })
      : null

    if (existing && existing.user_id !== userId) {
      throw new ForbiddenException()
    }

    const provider = await this.prisma.unifiedPushProvider.upsert({
      where: { endpoint_url: data.endpoint_url },
      update: {
        user_id: userId,
        device_id: device?.id,
        pub_key: data.pub_key ?? existing?.pub_key,
        auth: data.auth ?? existing?.auth,
      },
      create: {
        user_id: userId,
        device_id: device?.id,
        endpoint_url: data.endpoint_url,
        pub_key: data.pub_key,
        auth: data.auth,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

    if (device) {
      await this.realtimeService.sendQueuedCommands(device.id)
      await this.realtimeService.emitConnectionChange(device)
    }

    return provider
  }

  async delete(userId: bigint, data: PostUnregisterUnifiedPushRequestDto) {
    const provider = await this.prisma.unifiedPushProvider.findUnique({
      where: {
        endpoint_url: data.endpoint_url,
      },
      include: {
        device: true,
      },
    })

    if (!provider) {
      throw new NotFoundException("Unified Push provider not found")
    }

    if (provider.user_id !== userId) {
      throw new ForbiddenException()
    }

    await this.prisma.unifiedPushProvider.delete({
      where: { user_id: userId, endpoint_url: data.endpoint_url },
    })

    const device = provider.device
    if (device) {
      await this.realtimeService.emitConnectionChange(device)
    }
  }
}
