import { IsOptional, IsString } from "class-validator"

export class PostLockDeviceRequestDto {
  @IsString()
  @IsOptional()
  message?: string | null
}
