import { Device } from "@prisma/client"

export class DeviceDto {
  id: string
  user_id: string
  name: string
  color: string | null
  icon: string | null
  can_ring: boolean
  can_lock: boolean
  can_flash: boolean
  created_at: Date
  updated_at: Date

  static from(device: Device): DeviceDto {
    return {
      id: device.id.toString(),
      user_id: device.user_id.toString(),
      name: device.name,
      color: device.color,
      icon: device.icon,
      can_ring: device.can_ring,
      can_lock: device.can_lock,
      can_flash: device.can_flash,
      created_at: device.created_at,
      updated_at: device.updated_at,
    }
  }
}
