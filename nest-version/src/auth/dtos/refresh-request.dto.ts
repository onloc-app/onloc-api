import { IsNotEmpty, IsString } from "class-validator"

export class RefreshRequestDto {
  @IsString() @IsNotEmpty() refresh_token: string
}
