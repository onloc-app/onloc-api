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
import { AdminGuard } from "../auth/guards/auth.guard.js"
import { IdParam } from "../common/decorators/id-param.decorator.js"
import { SettingService } from "./setting.service.js"
import { SettingDto } from "./dtos/setting.dto.js"
import { PostSettingRequestDto } from "./dtos/requests/post-setting-request.dto.js"
import { PatchSettingRequestDto } from "./dtos/requests/patch-setting-request.dto.js"
import { PostSettingResponseDto } from "./dtos/responses/post-setting-response.dto.js"
import { GetSettingsResponseDto } from "./dtos/responses/get-settings-response.dto.js"
import { GetSettingResponseDto } from "./dtos/responses/get-setting-response.dto.js"
import { PatchSettingResponseDto } from "./dtos/responses/patch-setting-response.dto.js"

@UseGuards(AdminGuard)
@Controller("settings")
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @Post()
  async create(
    @Body() body: PostSettingRequestDto,
  ): Promise<PostSettingResponseDto> {
    const setting = await this.settingService.create(body)
    return { setting: SettingDto.from(setting) }
  }

  @Get()
  async findAll(): Promise<GetSettingsResponseDto> {
    const settings = await this.settingService.findAll()
    return {
      settings: settings.map((setting) => SettingDto.from(setting)),
    }
  }

  @Get(":id")
  async findOne(@IdParam() id: bigint): Promise<GetSettingResponseDto> {
    const setting = await this.settingService.findOne(id)
    return { setting: SettingDto.from(setting) }
  }

  @Patch()
  async update(
    @Body() body: PatchSettingRequestDto,
  ): Promise<PatchSettingResponseDto> {
    const setting = await this.settingService.update(body)
    return { setting: SettingDto.from(setting) }
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@IdParam() id: bigint): Promise<void> {
    await this.settingService.remove(id)
  }
}
