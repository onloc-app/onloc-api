import { IsBoolean, IsNotEmpty, IsNumberString } from "class-validator"

export class PostDeviceShareRequestDto {
  @IsNumberString()
  @IsNotEmpty()
  device_id: string

  @IsNumberString()
  @IsNotEmpty()
  connection_id: string

  @IsBoolean()
  can_ring: boolean

  @IsBoolean()
  can_lock: boolean

  @IsBoolean()
  can_flash: boolean
}
