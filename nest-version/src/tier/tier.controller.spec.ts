import { Test, TestingModule } from "@nestjs/testing"
import { TierController } from "./tier.controller.js"
import { TierService } from "./tier.service.js"

describe("TierController", () => {
  let controller: TierController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TierController],
      providers: [
        {
          provide: TierService,
          useValue: {},
        },
      ],
    }).compile()

    controller = module.get<TierController>(TierController)
  })

  it("should be defined", () => {
    expect(controller).toBeDefined()
  })
})
