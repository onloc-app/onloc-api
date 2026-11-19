import { DeviceShare } from "@prisma/client"

export class DeviceShareDto {
  id: string
  connection_id: string
  device_id: string
  user_id: string
  can_ring: boolean
  can_lock: boolean
  can_flash: boolean
  created_at: Date
  updated_at: Date

  static from(share: DeviceShare): DeviceShareDto {
    return {
      id: share.id.toString(),
      connection_id: share.connection_id.toString(),
      device_id: share.device_id.toString(),
      user_id: share.user_id.toString(),
      can_ring: share.can_ring,
      can_lock: share.can_lock,
      can_flash: share.can_flash,
      created_at: share.created_at,
      updated_at: share.updated_at,
    }
  }
}
