import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common"
import { TierService } from "./tier.service.js"
import { TierDto } from "./dtos/tier.dto.js"
import { PostTierRequestDto } from "./dtos/requests/post-tier-request.dto.js"
import { PatchTierRequestDto } from "./dtos/requests/patch-tier-request.dto.js"
import { PostReorderTiersRequestDto } from "./dtos/requests/post-reorder-tiers-request.dto.js"
import { PostTierResponseDto } from "./dtos/responses/post-tier-response.dto.js"
import { GetTiersResponseDto } from "./dtos/responses/get-tiers-response.dto.js"
import { GetTierResponseDto } from "./dtos/responses/get-tier-response.dto.js"
import { PatchTierResponseDto } from "./dtos/responses/patch-tier-response.dto.js"
import { AdminGuard } from "../auth/guards/auth.guard.js"
import { IdParam } from "../common/decorators/id-param.decorator.js"

@UseGuards(AdminGuard)
@Controller("tiers")
export class TierController {
  constructor(private readonly tierService: TierService) {}

  @Post()
  async create(@Body() body: PostTierRequestDto): Promise<PostTierResponseDto> {
    const tier = await this.tierService.create(body)
    return { tier: TierDto.from(tier) }
  }

  @Post("reorder")
  @HttpCode(HttpStatus.OK)
  async reorder(@Body() body: PostReorderTiersRequestDto): Promise<void> {
    await this.tierService.reorder(body.tiers)
  }

  @Get()
  async findAll(): Promise<GetTiersResponseDto> {
    const tiers = await this.tierService.findAll()
    return {
      tiers: tiers.map((tier) => TierDto.from(tier)),
    }
  }

  @Get(":id")
  async findOne(@IdParam() id: bigint): Promise<GetTierResponseDto> {
    const tier = await this.tierService.findOne(id)
    return { tier: TierDto.from(tier) }
  }

  @Patch()
  async update(
    @Body() body: PatchTierRequestDto,
  ): Promise<PatchTierResponseDto> {
    const tier = await this.tierService.update(body)
    return { tier: TierDto.from(tier) }
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@IdParam() id: bigint): Promise<void> {
    await this.tierService.remove(id)
  }
}
