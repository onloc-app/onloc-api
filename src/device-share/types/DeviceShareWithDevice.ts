import { Device, DeviceShare } from "@prisma/client"

export interface DeviceShareWithDevice extends DeviceShare {
  device: Device
}
