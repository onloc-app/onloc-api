import { Test, TestingModule } from "@nestjs/testing"
import { UserController } from "./user.controller.js"
import { UserService } from "./user.service.js"
import { PrismaService } from "../prisma/prisma.service.js"

describe("UserController", () => {
  let controller: UserController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile()

    controller = module.get<UserController>(UserController)
  })

  it("should be defined", () => {
    expect(controller).toBeDefined()
  })
})
