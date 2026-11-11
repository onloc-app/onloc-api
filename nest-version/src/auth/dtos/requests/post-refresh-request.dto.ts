import { IsNotEmpty, IsString } from "class-validator"

export class PostRefreshRequestDto {
  @IsString() @IsNotEmpty() refresh_token: string
}
