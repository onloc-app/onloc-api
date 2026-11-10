import {
  Body,
  Controller,
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

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post("login")
  async login(@Body() body: LoginRequestDto): Promise<LoginResponseDto> {
    const user = await this.authService.verify(body.username, body.password)
    if (!user) {
      throw new UnauthorizedException("Invalid username or password")
    }
    const { accessToken, refreshToken } = await this.tokenService.issue(
      user.id.toString(),
      { method: "password" },
    )
    return {
      user: user,
      access_token: accessToken,
      refresh_token: refreshToken,
    }
  }

  @Public()
  @Post("register")
  async register(
    @Body() body: RegisterRequestDto,
  ): Promise<RegisterResponseDto> {
    const user = await this.authService.register(body.username, body.password)
    const { accessToken, refreshToken } = await this.tokenService.issue(
      user.id.toString(),
      { method: "password" },
    )
    return {
      user: user,
      access_token: accessToken,
      refresh_token: refreshToken,
    }
  }
}
