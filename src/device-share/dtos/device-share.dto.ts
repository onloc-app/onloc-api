import { DeviceShare } from "@prisma/client"

export class DeviceShareDto {
  id: string
  user_id: string
  device_id: string
  connection_id: string
  can_ring: boolean
  can_lock: boolean
  can_flash: boolean
  created_at: Date
  updated_at: Date

  static from(deviceShare: DeviceShare): DeviceShareDto {
    return {
      id: deviceShare.id.toString(),
      user_id: deviceShare.user_id.toString(),
      device_id: deviceShare.device_id.toString(),
      connection_id: deviceShare.connection_id.toString(),
      can_ring: deviceShare.can_ring,
      can_lock: deviceShare.can_lock,
      can_flash: deviceShare.can_flash,
      created_at: deviceShare.created_at,
      updated_at: deviceShare.updated_at,
    }
  }
}
