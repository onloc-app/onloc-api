import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from "class-validator"

export class PostTierRequestDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsInt()
  @Min(0)
  @IsOptional()
  max_devices?: number
}
