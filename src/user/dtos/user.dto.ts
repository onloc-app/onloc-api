import { User } from "@prisma/client"

export class UserDto {
  id: string
  username: string
  admin: boolean
  created_at: Date
  updated_at: Date

  static from(user: User): UserDto {
    return {
      id: user.id.toString(),
      username: user.username,
      admin: user.admin,
      created_at: user.created_at,
      updated_at: user.updated_at,
    }
  }
}
