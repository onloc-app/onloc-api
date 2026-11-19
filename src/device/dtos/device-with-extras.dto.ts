import { DeviceWithExtras } from "../types/DeviceWithExtras.js"
import { DeviceShareDto } from "./device-share.dto.js"
import { DeviceDto } from "./device.dto.js"
import { LocationDto } from "./location.dto.js"

export class DeviceWithExtrasDto extends DeviceDto {
  latest_location: LocationDto | null
  device_share: DeviceShareDto | null
  is_connected: boolean

  static from(device: DeviceWithExtras): DeviceWithExtrasDto {
    return Object.assign(DeviceDto.from(device), {
      latest_location: device.latest_location
        ? LocationDto.from(device.latest_location)
        : null,
      device_share: device.device_share
        ? DeviceShareDto.from(device.device_share)
        : null,
      is_connected: device.is_connected,
    })
  }
}
