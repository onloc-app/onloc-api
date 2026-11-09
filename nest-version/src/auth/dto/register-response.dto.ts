import { UserDto } from "../../user/dto/user.dto"

export class RegisterResponseDto {
  user: UserDto
  access_token: string
  refresh_token: string
}
