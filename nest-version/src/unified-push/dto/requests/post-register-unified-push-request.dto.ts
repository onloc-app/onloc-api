import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from "class-validator"

export class PostRegisterUnifiedPushRequestDto {
  @IsNumberString()
  @IsOptional()
  device_id?: string | null

  @IsString()
  @IsNotEmpty()
  endpoint_url: string

  @IsString()
  @IsOptional()
  pub_key?: string | null

  @IsString()
  @IsOptional()
  auth?: string | null
}
