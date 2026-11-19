import { IsNotEmpty, IsString } from "class-validator"

export class PostSettingRequestDto {
  @IsString()
  @IsNotEmpty()
  key: string

  @IsString()
  @IsNotEmpty()
  value: string
}
