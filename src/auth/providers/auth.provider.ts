import {
  AuthenticationRegistry,
  AuthenticationResult,
  JwtBearerProvider,
  JwtClaims,
} from "@nestjs/authentication"
import { ExecutionContext, Injectable } from "@nestjs/common"
import { PrismaService } from "../../prisma/prisma.service.js"
import { User } from "@prisma/client"

@Injectable()
export class AuthProvider extends JwtBearerProvider<User> {
  constructor(
    private readonly prisma: PrismaService,
    registry: AuthenticationRegistry,
  ) {
    super()
    registry.registerProvider(this)
  }

  override async authenticate(
    context: ExecutionContext,
  ): Promise<AuthenticationResult<User, JwtClaims> | null> {
    const authHeader = this.header(context, "authorization")
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7).trim()
      if (token) {
        const apiKey = await this.prisma.apiKey.findUnique({
          where: { key: token },
          include: { user: true },
        })

        if (apiKey?.user) {
          return {
            user: apiKey.user,
            session: {
              sub: apiKey.user.id.toString(),
              keyId: apiKey.id.toString(),
            },
          }
        }
      }
    }

    return super.authenticate(context)
  }

  async validate({ sub }: JwtClaims): Promise<User | null> {
    let id: bigint
    try {
      id = BigInt(sub ?? "")
    } catch {
      return null
    }

    return await this.prisma.user.findUnique({ where: { id } })
  }
}
