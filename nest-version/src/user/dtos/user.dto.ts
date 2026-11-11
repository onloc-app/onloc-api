import { AvatarDto } from "../../avatar/dtos/avatar.dto"

export class UserDto {
  id: string
  username: string
  admin: boolean
  created_at: Date
  updated_at: Date
}
