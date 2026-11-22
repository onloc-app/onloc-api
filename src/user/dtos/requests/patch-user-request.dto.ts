import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator"

export class PatchUserRequestDto {
  @IsString() @IsNotEmpty() @IsOptional() username: string
  @IsString() @IsNotEmpty() @IsOptional() password: string
  @IsBoolean() @IsOptional() admin: boolean
}
