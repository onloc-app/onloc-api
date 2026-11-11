import { Test, TestingModule } from "@nestjs/testing"
import { describe, it, expect, beforeEach, vi } from "vitest"
import { PreferenceController } from "./preference.controller.js"
import { PreferenceService } from "./preference.service.js"

describe("PreferenceController", () => {
  let controller: PreferenceController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PreferenceController],
      providers: [
        {
          provide: PreferenceService,
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

    controller = module.get<PreferenceController>(PreferenceController)
  })

  it("should be defined", () => {
    expect(controller).toBeDefined()
  })
})
