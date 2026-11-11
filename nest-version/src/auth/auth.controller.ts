import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
} from "@nestjs/common"
import { AuthService } from "./auth.service.js"
import { PostLoginResponseDto } from "./dtos/responses/post-login-response.dto.js"
import { PostLoginRequestDto } from "./dtos/requests/post-login-request.dto.js"
import { PostRegisterResponseDto } from "./dtos/responses/post-register-response.dto.js"
import { Public, TokenService } from "@nestjs/authentication"
import { PostRegisterRequestDto } from "./dtos/requests/post-register-request.dto.js"
import { PostRefreshRequestDto } from "./dtos/requests/post-refresh-request.dto.js"
import { PostRefreshResponseDto } from "./dtos/responses/post-refresh-response.dto.js"
import { UserWithAvatarDto } from "../user/dtos/user-with-avatar.dto.js"
import { UserDto } from "../user/dtos/user.dto.js"

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post("login")
  async login(
    @Headers("user-agent") agent: string,
    @Body() body: PostLoginRequestDto,
  ): Promise<PostLoginResponseDto> {
    const user = await this.authService.login(body.username, body.password)
    if (!user) {
      throw new UnauthorizedException("Invalid username or password")
    }

    const { accessToken, refreshToken } = await this.tokenService.issue(
      user.id.toString(),
      { method: "password" },
    )

    this.authService.storeRefreshToken(BigInt(user.id), refreshToken, agent)

    return {
      user: UserWithAvatarDto.from(user),
      access_token: accessToken,
      refresh_token: refreshToken,
    }
  }

  @Public()
  @Post("register")
  async register(
    @Headers("user-agent") agent: string,
    @Body() body: PostRegisterRequestDto,
  ): Promise<PostRegisterResponseDto> {
    const user = await this.authService.register(body.username, body.password)

    const { accessToken, refreshToken } = await this.tokenService.issue(
      user.id.toString(),
      { method: "password" },
    )

    this.authService.storeRefreshToken(BigInt(user.id), refreshToken, agent)

    return {
      user: UserDto.from(user),
      access_token: accessToken,
      refresh_token: refreshToken,
    }
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post("refresh")
  async refresh(
    @Body() body: PostRefreshRequestDto,
  ): Promise<PostRefreshResponseDto> {
    return {
      access_token: await this.authService.refresh(body.refresh_token),
    }
  }
}
