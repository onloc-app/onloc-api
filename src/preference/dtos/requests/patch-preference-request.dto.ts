import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from "class-validator"

export class PatchPreferenceRequestDto {
  @IsNumberString()
  @IsNotEmpty()
  id: string

  @IsNumberString()
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
