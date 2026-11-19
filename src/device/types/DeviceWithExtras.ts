import { Device, DeviceShare, Location } from "@prisma/client"

export interface DeviceWithExtras extends Device {
  latest_location: Location | null
  device_share?: DeviceShare | null
  is_connected: boolean
}
