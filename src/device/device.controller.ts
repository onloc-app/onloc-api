import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Res,
} from "@nestjs/common"
import { CurrentUser } from "@nestjs/authentication"
import type { User } from "@prisma/client"
import type { Response } from "express"
import { IdParam } from "../common/decorators/id-param.decorator.js"
import { DeviceService } from "./device.service.js"
import { DeviceDto } from "./dtos/device.dto.js"
import { PostDeviceRequestDto } from "./dtos/requests/post-device-request.dto.js"
import { PatchDeviceRequestDto } from "./dtos/requests/patch-device-request.dto.js"
import { PostLockDeviceRequestDto } from "./dtos/requests/post-lock-device-request.dto.js"
import { PostDeviceResponseDto } from "./dtos/responses/post-device-response.dto.js"
import { GetDevicesResponseDto } from "./dtos/responses/get-devices-response.dto.js"
import { GetDeviceResponseDto } from "./dtos/responses/get-device-response.dto.js"
import { PatchDeviceResponseDto } from "./dtos/responses/patch-device-response.dto.js"
import { DeviceWithExtrasDto } from "./dtos/device-with-extras.dto.js"

@Controller("devices")
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Post()
  async create(
    @CurrentUser() user: User,
    @Body() body: PostDeviceRequestDto,
  ): Promise<PostDeviceResponseDto> {
    const device = await this.deviceService.create(user, body)
    return { device: DeviceDto.from(device) }
  }

  @Get()
  async findAll(@CurrentUser() user: User): Promise<GetDevicesResponseDto> {
    const devices = await this.deviceService.findAll(user.id)
    return {
      devices: devices.map((device) => {
        return DeviceWithExtrasDto.from(device)
      }),
    }
  }

  @Get("shared")
  async findShared(@CurrentUser() user: User): Promise<GetDevicesResponseDto> {
    const devices = await this.deviceService.findShared(user.id)
    return {
      devices: devices.map((device) => {
        return DeviceWithExtrasDto.from(device)
      }),
    }
  }

  @Get(":id")
  async findOne(
    @CurrentUser() user: User,
    @IdParam() id: bigint,
  ): Promise<GetDeviceResponseDto> {
    const device = await this.deviceService.findOne(user.id, id)
    return { device: DeviceWithExtrasDto.from(device) }
  }

  @Patch()
  async update(
    @CurrentUser() user: User,
    @Body() body: PatchDeviceRequestDto,
  ): Promise<PatchDeviceResponseDto> {
    const device = await this.deviceService.update(user.id, body)
    return { device: DeviceDto.from(device) }
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: User,
    @IdParam() id: bigint,
  ): Promise<void> {
    await this.deviceService.remove(user.id, id)
  }

  @Post(":id/ring")
  async ring(
    @CurrentUser() user: User,
    @IdParam() id: bigint,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const result = await this.deviceService.ring(user.id, id)
    res.status(result.queued ? HttpStatus.ACCEPTED : HttpStatus.OK).send()
  }

  @Post(":id/lock")
  async lock(
    @CurrentUser() user: User,
    @IdParam() id: bigint,
    @Body() body: PostLockDeviceRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const result = await this.deviceService.lock(user.id, id, body)
    res.status(result.queued ? HttpStatus.ACCEPTED : HttpStatus.OK).send()
  }

  @Post(":id/flash")
  async flash(
    @CurrentUser() user: User,
    @IdParam() id: bigint,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const result = await this.deviceService.flash(user.id, id)
    res.status(result.queued ? HttpStatus.ACCEPTED : HttpStatus.OK).send()
  }
}
