import { Test, TestingModule } from "@nestjs/testing"
import { describe, it, expect, beforeEach, vi } from "vitest"
import { ApiKeyController } from "./api-key.controller.js"
import { ApiKeyService } from "./api-key.service.js"

describe("ApiKeyController", () => {
  let controller: ApiKeyController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiKeyController],
      providers: [
        {
          provide: ApiKeyService,
          useValue: {
            create: vi.fn(),
            findAll: vi.fn(),
            remove: vi.fn(),
          },
        },
      ],
    }).compile()

    controller = module.get<ApiKeyController>(ApiKeyController)
  })

  it("should be defined", () => {
    expect(controller).toBeDefined()
  })
})
