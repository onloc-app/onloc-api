import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from "@nestjs/common"
import { CurrentUser } from "@nestjs/authentication"
import type { User } from "@prisma/client"
import { IdParam } from "../common/decorators/id-param.decorator.js"
import { ApiKeyService } from "./api-key.service.js"
import { ApiKeyDto } from "./dtos/api-key.dto.js"
import { PostApiKeyRequestDto } from "./dtos/requests/post-api-key-request.dto.js"
import { PostApiKeyResponseDto } from "./dtos/responses/post-api-key-response.dto.js"
import { GetApiKeysResponseDto } from "./dtos/responses/get-api-keys-response.dto.js"

@Controller("apikeys")
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Post()
  async create(
    @CurrentUser() user: User,
    @Body() body: PostApiKeyRequestDto,
  ): Promise<PostApiKeyResponseDto> {
    const apiKey = await this.apiKeyService.create(user.id, body)
    return { api_key: ApiKeyDto.from(apiKey) }
  }

  @Get()
  async findAll(@CurrentUser() user: User): Promise<GetApiKeysResponseDto> {
    const apiKeys = await this.apiKeyService.findAll(user.id)
    return {
      api_keys: apiKeys.map((apiKey) => ApiKeyDto.from(apiKey)),
    }
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: User,
    @IdParam() id: bigint,
  ): Promise<void> {
    await this.apiKeyService.remove(user.id, id)
  }
}
