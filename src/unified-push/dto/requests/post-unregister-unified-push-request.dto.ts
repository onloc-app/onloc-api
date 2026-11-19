import { IsNotEmpty, IsString } from "class-validator"

export class PostUnregisterUnifiedPushRequestDto {
  @IsString()
  @IsNotEmpty()
  endpoint_url: string
}
