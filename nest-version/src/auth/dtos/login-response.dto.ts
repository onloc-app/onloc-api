import { UserWithAvatarDto } from "../../user/dtos/user-with-avatar.dto"

export class LoginResponseDto {
  user: UserWithAvatarDto
  access_token: string
  refresh_token: string
}
