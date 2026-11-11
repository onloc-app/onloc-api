import { Test, TestingModule } from "@nestjs/testing"
import { AvatarController } from "./avatar.controller.js"
import { AvatarService } from "./avatar.service.js"
import type { User } from "@prisma/client"
import { Readable } from "stream"

describe("AvatarController", () => {
  let controller: AvatarController
  let service: AvatarService

  const mockAvatarService = {
    store: vi.fn(),
    remove: vi.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AvatarController],
      providers: [
        {
          provide: AvatarService,
          useValue: mockAvatarService,
        },
      ],
    }).compile()

    controller = module.get<AvatarController>(AvatarController)
    service = module.get<AvatarService>(AvatarService)
  })

  it("should be defined", () => {
    expect(controller).toBeDefined()
  })

  describe("upsert", () => {
    it("should store and return avatar", async () => {
      const mockUser: User = {
        id: 1n,
        username: "test",
        password: "password",
        admin: false,
        created_at: new Date(),
        updated_at: new Date(),
      }
      const mockFile = {
        fieldname: "avatar",
        originalname: "test.png",
        encoding: "7bit",
        mimetype: "image/png",
        size: 1024,
        destination: "",
        filename: "test.png",
        path: "",
        buffer: Buffer.from(""),
        stream: new Readable(),
      } as unknown as Express.Multer.File
      const mockAvatar = {
        id: 1n,
        user_id: 1n,
        url: "uploads/avatars/1.png",
        created_at: new Date(),
        updated_at: new Date(),
      }
      const expectedDto = {
        id: "1",
        user_id: "1",
        url: "uploads/avatars/1.png",
        created_at: mockAvatar.created_at,
        updated_at: mockAvatar.updated_at,
      }

      mockAvatarService.store.mockResolvedValue(mockAvatar)

      const result = await controller.upsert(mockUser, mockFile)

      expect(service.store).toHaveBeenCalledWith(mockUser, mockFile)
      expect(result).toEqual(expectedDto)
    })
  })

  describe("remove", () => {
    it("should remove avatar", async () => {
      const mockUser: User = {
        id: 1n,
        username: "test",
        password: "password",
        admin: false,
        created_at: new Date(),
        updated_at: new Date(),
      }
      mockAvatarService.remove.mockResolvedValue(undefined)

      await controller.remove(mockUser)

      expect(service.remove).toHaveBeenCalledWith(mockUser)
    })
  })
})
