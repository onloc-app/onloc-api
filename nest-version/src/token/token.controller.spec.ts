import { Test, TestingModule } from "@nestjs/testing"
import { describe, it, expect, beforeEach, vi } from "vitest"
import { TokenController } from "./token.controller.js"
import { TokenService } from "./token.service.js"

describe("TokenController", () => {
  let controller: TokenController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TokenController],
      providers: [
        {
          provide: TokenService,
          useValue: {
            findAll: vi.fn(),
            removeById: vi.fn(),
            removeByToken: vi.fn(),
          },
        },
      ],
    }).compile()

    controller = module.get<TokenController>(TokenController)
  })

  it("should be defined", () => {
    expect(controller).toBeDefined()
  })
})
