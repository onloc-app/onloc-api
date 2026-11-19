import { IsNotEmpty, IsString } from "class-validator"

export class DeleteTokenRequestDto {
  @IsString()
  @IsNotEmpty()
  refresh_token: string
}
