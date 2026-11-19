import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from "class-validator"

export class PatchSettingRequestDto {
  @IsNumberString()
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
