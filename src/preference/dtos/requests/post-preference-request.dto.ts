import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from "class-validator"

export class PostPreferenceRequestDto {
  @IsNumberString()
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
