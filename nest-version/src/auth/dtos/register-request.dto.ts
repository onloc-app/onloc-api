import { IsNotEmpty, IsString } from "class-validator"

export class RegisterRequestDto {
  @IsString() @IsNotEmpty() username: string
  @IsString() @IsNotEmpty() password: string
}
