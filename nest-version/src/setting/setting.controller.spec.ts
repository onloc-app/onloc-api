import { Test, TestingModule } from "@nestjs/testing"
import { describe, it, expect, beforeEach, vi } from "vitest"
import { SettingController } from "./setting.controller.js"
import { SettingService } from "./setting.service.js"

describe("SettingController", () => {
  let controller: SettingController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SettingController],
      providers: [
        {
          provide: SettingService,
          useValue: {
            create: vi.fn(),
            findAll: vi.fn(),
            findOne: vi.fn(),
            update: vi.fn(),
            remove: vi.fn(),
          },
        },
      ],
    }).compile()

    controller = module.get<SettingController>(SettingController)
  })

  it("should be defined", () => {
    expect(controller).toBeDefined()
  })
})
