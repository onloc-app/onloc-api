import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from "@nestjs/common"
import { DeviceShareService } from "./device-share.service.js"
import { CurrentUser } from "@nestjs/authentication"
import type { User } from "@prisma/client"
import { PostDeviceShareRequestDto } from "./dtos/requests/post-device-share-request.dto.js"
import { DeviceShareDto } from "./dtos/device-share.dto.js"
import { PostDeviceShareResponseDto } from "./dtos/responses/post-device-share-response.dto.js"
import { GetDeviceSharesResponseDto } from "./dtos/responses/get-device-shares-response.dto.js"
import { IdParam } from "../common/decorators/id-param.decorator.js"
import { DeviceShareWithDeviceDto } from "./dtos/device-share-with-device.dto.js"

@Controller("deviceshares")
export class DeviceShareController {
  constructor(private readonly deviceShareService: DeviceShareService) {}

  @Post()
  async create(
    @CurrentUser() user: User,
    @Body() body: PostDeviceShareRequestDto,
  ): Promise<PostDeviceShareResponseDto> {
    const deviceShare = await this.deviceShareService.create(user.id, body)
    return { device_share: DeviceShareDto.from(deviceShare) }
  }

  @Get()
  async findAll(
    @CurrentUser() user: User,
  ): Promise<GetDeviceSharesResponseDto> {
    const deviceShares = await this.deviceShareService.findAll(user.id)
    return {
      device_shares: deviceShares.map((deviceShare) => {
        return DeviceShareWithDeviceDto.from(deviceShare)
      }),
    }
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: User,
    @IdParam() id: bigint,
  ): Promise<void> {
    await this.deviceShareService.remove(user.id, id)
  }
}
