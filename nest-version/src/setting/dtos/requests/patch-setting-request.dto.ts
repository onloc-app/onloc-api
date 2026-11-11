import { IsNotEmpty, IsOptional, IsString } from "class-validator"

export class PatchSettingRequestDto {
  @IsString()
  @IsNotEmpty()
  id: string

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  key?: string

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  value?: string
}
