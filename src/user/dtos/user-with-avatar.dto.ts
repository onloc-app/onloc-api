import { AvatarDto } from "../../avatar/dtos/avatar.dto.js"
import { UserWithAvatar } from "../types/UserWithAvatar.js"
import { UserDto } from "./user.dto.js"

export class UserWithAvatarDto extends UserDto {
  avatar: AvatarDto | null

  static from(user: UserWithAvatar): UserWithAvatarDto {
    const avatar = user.avatar
    return Object.assign(UserDto.from(user), {
      avatar: avatar ? AvatarDto.from(avatar) : null,
    })
  }
}
