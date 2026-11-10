import { UserDto } from "../../user/dtos/user.dto"

export class LoginResponseDto {
  user: UserDto
  access_token: string
  refresh_token: string
}
