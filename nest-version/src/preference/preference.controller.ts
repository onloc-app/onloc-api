import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
} from "@nestjs/common"
import { CurrentUser } from "@nestjs/authentication"
import type { User } from "@prisma/client"
import { IdParam } from "../common/decorators/id-param.decorator.js"
import { PreferenceService } from "./preference.service.js"
import { PreferenceDto } from "./dtos/preference.dto.js"
import { PostPreferenceRequestDto } from "./dtos/requests/post-preference-request.dto.js"
import { PatchPreferenceRequestDto } from "./dtos/requests/patch-preference-request.dto.js"
import { PostPreferenceResponseDto } from "./dtos/responses/post-preference-response.dto.js"
import { GetPreferencesResponseDto } from "./dtos/responses/get-preferences-response.dto.js"
import { GetPreferenceResponseDto } from "./dtos/responses/get-preference-response.dto.js"
import { PatchPreferenceResponseDto } from "./dtos/responses/patch-preference-response.dto.js"

@Controller("preferences")
export class PreferenceController {
  constructor(private readonly preferenceService: PreferenceService) {}

  @Post()
  async create(
    @CurrentUser() user: User,
    @Body() body: PostPreferenceRequestDto,
  ): Promise<PostPreferenceResponseDto> {
    const preference = await this.preferenceService.create(user.id, body)
    return { preference: PreferenceDto.from(preference) }
  }

  @Get()
  async findAll(
    @CurrentUser() user: User,
    @Query("key") key?: string,
  ): Promise<GetPreferencesResponseDto> {
    const preferences = await this.preferenceService.findAll(user.id, key)
    return {
      preferences: preferences.map((p) => PreferenceDto.from(p)),
    }
  }

  @Get(":id")
  async findOne(
    @CurrentUser() user: User,
    @IdParam() id: bigint,
  ): Promise<GetPreferenceResponseDto> {
    const preference = await this.preferenceService.findOne(user.id, id)
    return { preference: PreferenceDto.from(preference) }
  }

  @Patch()
  async update(
    @CurrentUser() user: User,
    @Body() body: PatchPreferenceRequestDto,
  ): Promise<PatchPreferenceResponseDto> {
    const preference = await this.preferenceService.update(user.id, body)
    return { preference: PreferenceDto.from(preference) }
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: User,
    @IdParam() id: bigint,
  ): Promise<void> {
    await this.preferenceService.remove(id, user.id)
  }
}
