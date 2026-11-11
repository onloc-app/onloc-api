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
import { LoginResponseDto } from "./dtos/login-response.dto.js"
import { LoginRequestDto } from "./dtos/login-request.dto.js"
import { RegisterResponseDto } from "./dtos/register-response.dto.js"
import { Public, TokenService } from "@nestjs/authentication"
import { RegisterRequestDto } from "./dtos/register-request.dto.js"
import { RefreshRequestDto } from "./dtos/refresh-request.dto.js"
import { RefreshResponseDto } from "./dtos/refresh-response.dto.js"

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
    @Body() body: LoginRequestDto,
  ): Promise<LoginResponseDto> {
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
      user: {
        id: user.id.toString(),
        username: user.username,
        admin: user.admin,
        created_at: user.created_at,
        updated_at: user.updated_at,
        avatar: user.avatar && {
          id: user.avatar.id.toString(),
          user_id: user.avatar.user_id.toString(),
          url: user.avatar.url,
          created_at: user.avatar.created_at,
          updated_at: user.avatar.updated_at,
        },
      },
      access_token: accessToken,
      refresh_token: refreshToken,
    }
  }

  @Public()
  @Post("register")
  async register(
    @Headers("user-agent") agent: string,
    @Body() body: RegisterRequestDto,
  ): Promise<RegisterResponseDto> {
    const user = await this.authService.register(body.username, body.password)

    const { accessToken, refreshToken } = await this.tokenService.issue(
      user.id.toString(),
      { method: "password" },
    )

    this.authService.storeRefreshToken(BigInt(user.id), refreshToken, agent)

    return {
      user: {
        id: user.id.toString(),
        username: user.username,
        admin: user.admin,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
      access_token: accessToken,
      refresh_token: refreshToken,
    }
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post("refresh")
  async refresh(@Body() body: RefreshRequestDto): Promise<RefreshResponseDto> {
    return {
      access_token: await this.authService.refresh(body.refresh_token),
    }
  }
}
