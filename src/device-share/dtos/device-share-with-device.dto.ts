import { DeviceDto } from "../../device/dtos/device.dto.js"
import { DeviceShareWithDevice } from "../types/DeviceShareWithDevice.js"
import { DeviceShareDto } from "./device-share.dto.js"

export class DeviceShareWithDeviceDto extends DeviceShareDto {
  device: DeviceDto

  static from(deviceShare: DeviceShareWithDevice): DeviceShareWithDeviceDto {
    return Object.assign(DeviceShareDto.from(deviceShare), {
      device: DeviceDto.from(deviceShare.device),
    })
  }
}
