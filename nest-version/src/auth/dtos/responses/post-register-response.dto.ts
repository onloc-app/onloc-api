import { UserDto } from "../../../user/dtos/user.dto.js"

export class PostRegisterResponseDto {
  user: UserDto
  access_token: string
  refresh_token: string
}
