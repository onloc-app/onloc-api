import { Avatar } from "@prisma/client"

export class AvatarDto {
  id: string
  user_id: string
  url: string
  created_at: Date
  updated_at: Date

  static from(avatar: Avatar): AvatarDto {
    return {
      id: avatar.id.toString(),
      user_id: avatar.user_id.toString(),
      url: avatar.url,
      created_at: avatar.created_at,
      updated_at: avatar.updated_at,
    }
  }
}
