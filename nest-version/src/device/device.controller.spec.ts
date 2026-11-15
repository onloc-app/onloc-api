import { Test, TestingModule } from "@nestjs/testing"
import { describe, it, expect, beforeEach, vi } from "vitest"
import { DeviceController } from "./device.controller.js"
import { DeviceService } from "./device.service.js"

describe("DeviceController", () => {
  let controller: DeviceController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeviceController],
      providers: [
        {
          provide: DeviceService,
          useValue: {
            create: vi.fn(),
            findAll: vi.fn(),
            findShared: vi.fn(),
            findOne: vi.fn(),
            update: vi.fn(),
            remove: vi.fn(),
            ring: vi.fn(),
            lock: vi.fn(),
            flash: vi.fn(),
          },
        },
      ],
    }).compile()

    controller = module.get<DeviceController>(DeviceController)
  })

  it("should be defined", () => {
    expect(controller).toBeDefined()
  })
})
