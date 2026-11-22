import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common"
import { UnifiedPushService } from "./unified-push.service.js"
import { CurrentUser } from "@nestjs/authentication"
import type { User } from "@prisma/client"
import { PostRegisterUnifiedPushRequestDto } from "./dto/requests/post-register-unified-push-request.dto.js"
import { UnifiedPushProviderDto } from "./dto/unified-push-provider.dto.js"
import { PostUnregisterUnifiedPushRequestDto } from "./dto/requests/post-unregister-unified-push-request.dto.js"
import { PostRegisterUnifiedPushResponseDto } from "./dto/responses/post-register-unified-push-response.dto.js"

@Controller("unifiedpush")
export class UnifiedPushController {
  constructor(private readonly unifiedPushService: UnifiedPushService) {}

  @Post("register")
  async register(
    @CurrentUser() user: User,
    @Body() body: PostRegisterUnifiedPushRequestDto,
  ): Promise<PostRegisterUnifiedPushResponseDto> {
    const unifiedPushProvider = await this.unifiedPushService.create(
      user.id,
      body,
    )
    return {
      unified_push_provider: UnifiedPushProviderDto.from(unifiedPushProvider),
    }
  }

  @Post("unregister")
  @HttpCode(HttpStatus.NO_CONTENT)
  async unregister(
    @CurrentUser() user: User,
    @Body() body: PostUnregisterUnifiedPushRequestDto,
  ): Promise<void> {
    await this.unifiedPushService.delete(user.id, body)
  }
}
