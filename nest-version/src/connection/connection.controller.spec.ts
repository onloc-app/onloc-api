import { Test, TestingModule } from "@nestjs/testing"
import { describe, it, expect, beforeEach, vi } from "vitest"
import { ConnectionController } from "./connection.controller.js"
import { ConnectionService } from "./connection.service.js"

describe("ConnectionController", () => {
  let controller: ConnectionController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConnectionController],
      providers: [
        {
          provide: ConnectionService,
          useValue: {
            sendRequest: vi.fn(),
            accept: vi.fn(),
            reject: vi.fn(),
            findAll: vi.fn(),
          },
        },
      ],
    }).compile()

    controller = module.get<ConnectionController>(ConnectionController)
  })

  it("should be defined", () => {
    expect(controller).toBeDefined()
  })
})
