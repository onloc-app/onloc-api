import { Type } from "class-transformer"
import {
  IsBoolean,
  IsDate,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator"

export class PostLocationRequestDto {
  @IsNumberString()
  @IsNotEmpty()
  device_id: string

  @IsNumber()
  @IsOptional()
  accuracy?: number | null

  @IsNumber()
  @IsOptional()
  altitude?: number | null

  @IsNumber()
  @IsOptional()
  altitude_accuracy?: number | null

  @IsLatitude()
  latitude: number

  @IsLongitude()
  longitude: number

  @IsNumber()
  @IsOptional()
  bearing?: number | null

  @IsNumber()
  @IsOptional()
  bearing_accuracy_degrees?: number | null

  @IsNumber()
  @IsOptional()
  speed?: number | null

  @IsNumber()
  @IsOptional()
  speed_accuracy?: number | null

  @IsString()
  @IsOptional()
  provider?: string | null

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  battery?: number | null

  @IsBoolean()
  @IsOptional()
  charging?: boolean | null

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  created_at?: Date | null
}
