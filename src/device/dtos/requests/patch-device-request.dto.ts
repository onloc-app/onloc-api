import {
  IsBoolean,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from "class-validator"

export class PatchDeviceRequestDto {
  @IsNumberString()
  @IsNotEmpty()
  id: string

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string

  @IsString()
  @IsOptional()
  color?: string | null

  @IsString()
  @IsOptional()
  icon?: string | null

  @IsBoolean()
  @IsOptional()
  can_ring?: boolean

  @IsBoolean()
  @IsOptional()
  can_lock?: boolean

  @IsBoolean()
  @IsOptional()
  can_flash?: boolean
}
