import { Test, TestingModule } from "@nestjs/testing"
import { AppController } from "./app.controller.js"
import { AppService } from "./app.service.js"
import { HealthCheckService, PrismaHealthIndicator } from "@nestjs/terminus"
import { PrismaService } from "./prisma/prisma.service.js"

describe("AppController", () => {
  let appController: AppController

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            getApiVersion: () => "1.0.0",
            isSetup: async () => true,
            isRegistrationEnabled: async () => false,
          },
        },
        {
          provide: HealthCheckService,
          useValue: {
            check: async () => ({ status: "ok", details: {} }),
          },
        },
        {
          provide: PrismaHealthIndicator,
          useValue: {
            pingCheck: async () => ({ database: { status: "up" } }),
          },
        },
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile()

    appController = app.get<AppController>(AppController)
  })

  describe("status", () => {
    it("should return status response", async () => {
      const result = await appController.status()
      expect(result).toEqual({
        is_setup: true,
        registration: false,
        version: "1.0.0",
      })
    })
  })

  describe("check", () => {
    it("should return health check result", async () => {
      const result = await appController.check()
      expect(result).toEqual({ status: "ok", details: {} })
    })
  })
})
