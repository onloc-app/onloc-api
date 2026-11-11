import { IsNotEmpty, IsString } from "class-validator"

export class PostRegisterRequestDto {
  @IsString() @IsNotEmpty() username: string
  @IsString() @IsNotEmpty() password: string
}
