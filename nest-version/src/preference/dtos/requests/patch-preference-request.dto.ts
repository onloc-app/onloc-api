import { IsNotEmpty, IsOptional, IsString } from "class-validator"

export class PatchPreferenceRequestDto {
  @IsString()
  @IsNotEmpty()
  id: string

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  user_id?: string

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  key?: string

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  value?: string
}
