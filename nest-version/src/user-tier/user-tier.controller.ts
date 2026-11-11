import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common"
import { AdminGuard } from "../auth/guards/auth.guard.js"
import { UserTierService } from "./user-tier.service.js"
import { PostUserTierRequestDto } from "./dtos/requests/post-user-tier-request.dto.js"
import { PostUserTierResponseDto } from "./dtos/responses/post-user-tier-response.dto.js"
import { GetUserTiersResponseDto } from "./dtos/responses/get-user-tiers-response.dto.js"
import { UserTierDto } from "./dtos/user-tier.dto.js"

@UseGuards(AdminGuard)
@Controller("usertiers")
export class UserTierController {
  constructor(private readonly userTierService: UserTierService) {}

  @Post()
  async create(
    @Body() body: PostUserTierRequestDto,
  ): Promise<PostUserTierResponseDto> {
    const userTier = await this.userTierService.assignOrUpdate(body)
    return { user_tier: UserTierDto.from(userTier) }
  }

  @Get()
  async findAll(): Promise<GetUserTiersResponseDto> {
    const userTiers = await this.userTierService.findAll()
    return {
      user_tiers: userTiers.map((userTier) => UserTierDto.from(userTier)),
    }
  }
}
