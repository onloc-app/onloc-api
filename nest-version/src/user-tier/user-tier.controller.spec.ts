import { Test, TestingModule } from "@nestjs/testing"
import { describe, it, expect, beforeEach, vi } from "vitest"
import { UserTierController } from "./user-tier.controller.js"
import { UserTierService } from "./user-tier.service.js"

describe("UserTierController", () => {
  let controller: UserTierController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserTierController],
      providers: [
        {
          provide: UserTierService,
          useValue: {
            assignOrUpdate: vi.fn(),
            findAll: vi.fn(),
            checkPermissions: vi.fn(),
          },
        },
      ],
    }).compile()

    controller = module.get<UserTierController>(UserTierController)
  })

  it("should be defined", () => {
    expect(controller).toBeDefined()
  })
})
