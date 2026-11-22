import { RefreshToken } from "@prisma/client"

export class TokenDto {
  id: string
  user_id: string
  token: string
  agent: string | null
  created_at: Date
  updated_at: Date

  static from(token: RefreshToken): TokenDto {
    return {
      id: token.id.toString(),
      user_id: token.user_id.toString(),
      token: token.token,
      agent: token.agent,
      created_at: token.created_at,
      updated_at: token.updated_at,
    }
  }
}
