import { IsNotEmpty, IsString } from "class-validator"

export class PostLoginRequestDto {
  @IsString() @IsNotEmpty() username: string
  @IsString() @IsNotEmpty() password: string
}
