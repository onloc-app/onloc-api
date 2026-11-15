import { Test, TestingModule } from "@nestjs/testing"
import { UserController } from "./user.controller.js"
import { UserService } from "./user.service.js"
import { vi, describe, beforeEach, it, expect } from "vitest"

describe("UserController", () => {
  let controller: UserController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            findAll: vi.fn(),
            findOne: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            remove: vi.fn(),
          },
        },
      ],
    }).compile()

    controller = module.get<UserController>(UserController)
  })

  it("should be defined", () => {
    expect(controller).toBeDefined()
  })
})
