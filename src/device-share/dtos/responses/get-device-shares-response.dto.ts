import { DeviceShareWithDeviceDto } from "../device-share-with-device.dto.js"
import { DeviceShareDto } from "../device-share.dto.js"

export class GetDeviceSharesResponseDto {
  device_shares: DeviceShareWithDeviceDto[]
}
