import {
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  Min,
} from "class-validator"

export class PatchTierRequestDto {
  @IsNumberString()
  @IsNotEmpty()
  id: string

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string

  @IsInt()
  @Min(0)
  @IsOptional()
  max_devices?: number
}
