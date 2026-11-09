import { Controller, Get } from "@nestjs/common"
import {
  HealthCheckService,
  HealthCheck,
  PrismaHealthIndicator,
} from "@nestjs/terminus"
import { AppService } from "./app.service.js"
import { PrismaService } from "./prisma/prisma.service.js"
import { StatusResponseDto } from "./dto/status-response.dto.js"
import { Public } from "@nestjs/authentication"

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private health: HealthCheckService,
    private indicator: PrismaHealthIndicator,
    private prisma: PrismaService,
  ) {}

  @Public()
  @Get("status")
  async status(): Promise<StatusResponseDto> {
    return {
      is_setup: await this.appService.isSetup(),
      registration: await this.appService.isRegistrationEnabled(),
      version: this.appService.getApiVersion(),
    }
  }

  @Public()
  @Get("health")
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.indicator.pingCheck("database", this.prisma),
    ])
  }
}
