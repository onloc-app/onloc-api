import { IsNotEmpty, IsOptional, IsString } from "class-validator"

export class PostPreferenceRequestDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  user_id?: string

  @IsString()
  @IsNotEmpty()
  key: string

  @IsString()
  @IsNotEmpty()
  value: string
}
