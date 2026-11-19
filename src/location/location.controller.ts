import { CurrentUser } from "@nestjs/authentication"
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  ParseBoolPipe,
  ParseDatePipe,
  Post,
  Query,
} from "@nestjs/common"
import type { User } from "@prisma/client"
import { LocationService } from "./location.service.js"
import { PostLocationRequestDto } from "./dtos/requests/post-location-request.dto.js"
import { PostLocationResponseDto } from "./dtos/responses/post-location-response.dto.js"
import { LocationDto } from "./dtos/location.dto.js"
import { PostLocationsRequestDto } from "./dtos/requests/post-locations-request.dto.js"
import { PostLocationsResponseDto } from "./dtos/responses/post-locations-response.dto.js"
import { GetLocationsResponseDto } from "./dtos/responses/get-locations-response.dto.js"
import { IdParam } from "../common/decorators/id-param.decorator.js"
import { GetLocationResponseDto } from "./dtos/responses/get-location-response.dto.js"
import { GetAvailableDatesResponseDto } from "./dtos/responses/get-available-dates-response.dto.js"

@Controller("locations")
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post()
  async create(
    @CurrentUser() user: User,
    @Body() body: PostLocationRequestDto,
  ): Promise<PostLocationResponseDto> {
    const location = await this.locationService.create(user.id, body)
    return { location: LocationDto.from(location) }
  }

  @Post("batch")
  async createBatch(
    @CurrentUser() user: User,
    @Body() body: PostLocationsRequestDto,
  ): Promise<PostLocationsResponseDto> {
    const locations = await this.locationService.createBatch(user.id, body)
    return {
      locations: locations.map((location) => LocationDto.from(location)),
    }
  }

  @Get()
  async findAll(
    @CurrentUser() user: User,
    @Query("device_id") deviceId?: string,
    @Query("start_date", new ParseDatePipe({ optional: true }))
    startDate?: Date,
    @Query("end_date", new ParseDatePipe({ optional: true })) endDate?: Date,
    @Query("latest", new ParseBoolPipe({ optional: true })) latest?: boolean,
  ): Promise<GetLocationsResponseDto> {
    const locations = await this.locationService.findAll(
      user.id,
      deviceId ? BigInt(deviceId) : undefined,
      startDate,
      endDate,
      latest,
    )
    return {
      locations: locations.map((location) => {
        return LocationDto.from(location)
      }),
    }
  }

  @Get(":id")
  async findOne(
    @CurrentUser() user: User,
    @IdParam() id: bigint,
  ): Promise<GetLocationResponseDto> {
    const location = await this.locationService.findOne(user.id, id)
    return { location: LocationDto.from(location) }
  }

  @Get(":id/dates")
  async availableDates(
    @CurrentUser() user: User,
    @IdParam() deviceId: bigint,
  ): Promise<GetAvailableDatesResponseDto> {
    const dates = await this.locationService.findOneAvailableDates(
      user.id,
      deviceId,
    )
    return { dates: dates }
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAll(
    @CurrentUser() user: User,
    @Query("user_id") userId: string,
  ): Promise<void> {
    await this.locationService.deleteAll(user, BigInt(userId))
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @CurrentUser() user: User,
    @IdParam() id: bigint,
  ): Promise<void> {
    await this.locationService.delete(user.id, id)
  }
}
