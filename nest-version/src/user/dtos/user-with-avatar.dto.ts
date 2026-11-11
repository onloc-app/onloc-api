import { AvatarDto } from "../../avatar/dtos/avatar.dto"
import { UserDto } from "./user.dto"

export class UserWithAvatarDto extends UserDto {
  avatar: AvatarDto | null
}
