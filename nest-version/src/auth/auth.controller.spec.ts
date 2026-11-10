import { Test, TestingModule } from "@nestjs/testing"
import { AuthController } from "./auth.controller.js"
import { AuthService } from "./auth.service.js"
import { TokenService } from "@nestjs/authentication"

describe("AuthController", () => {
  let controller: AuthController
  let authService: AuthService

  const mockAuthService = {
    login: vi.fn(),
    register: vi.fn(),
    storeRefreshToken: vi.fn(),
    refresh: vi.fn(),
  }

  const mockTokenService = {
    issue: vi.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: TokenService,
          useValue: mockTokenService,
        },
      ],
    }).compile()

    controller = module.get<AuthController>(AuthController)
    authService = module.get<AuthService>(AuthService)
  })

  it("should be defined", () => {
    expect(controller).toBeDefined()
  })

  describe("refresh", () => {
    it("should refresh the access token", async () => {
      const mockNewToken = "new-access-token"
      mockAuthService.refresh.mockResolvedValue(mockNewToken)

      const result = await controller.refresh({
        refresh_token: "valid-refresh-token",
      })

      expect(authService.refresh).toHaveBeenCalledWith("valid-refresh-token")
      expect(result).toEqual({ access_token: mockNewToken })
    })
  })
})
