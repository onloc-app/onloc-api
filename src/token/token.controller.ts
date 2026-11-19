import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
} from "@nestjs/common"
import { CurrentUser } from "@nestjs/authentication"
import type { User } from "@prisma/client"
import { IdParam } from "../common/decorators/id-param.decorator.js"
import { TokenService } from "./token.service.js"
import { TokenDto } from "./dtos/token.dto.js"
import { GetTokensResponseDto } from "./dtos/responses/get-tokens-response.dto.js"
import { DeleteTokenRequestDto } from "./dtos/requests/delete-token-request.dto.js"

@Controller("tokens")
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Get()
  async findAll(@CurrentUser() user: User): Promise<GetTokensResponseDto> {
    const tokens = await this.tokenService.findAll(user.id)
    return {
      tokens: tokens.map((token) => TokenDto.from(token)),
    }
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeById(
    @CurrentUser() user: User,
    @IdParam() id: bigint,
  ): Promise<void> {
    await this.tokenService.removeById(user.id, id)
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeByToken(
    @CurrentUser() user: User,
    @Body() body: DeleteTokenRequestDto,
  ): Promise<void> {
    await this.tokenService.removeByToken(user.id, body.refresh_token)
  }
}
