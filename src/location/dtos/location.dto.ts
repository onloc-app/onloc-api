import { Location } from "@prisma/client"

export class LocationDto {
  id: string
  device_id: string
  accuracy: number | null
  altitude: number | null
  altitude_accuracy: number | null
  latitude: number
  longitude: number
  bearing: number | null
  bearing_accuracy_degrees: number | null
  speed: number | null
  speed_accuracy: number | null
  provider: string | null
  battery: number | null
  charging: boolean | null
  created_at: Date
  updated_at: Date

  static from(location: Location): LocationDto {
    return {
      id: location.id.toString(),
      device_id: location.device_id.toString(),
      accuracy: location.accuracy,
      altitude: location.altitude,
      altitude_accuracy: location.altitude_accuracy,
      latitude: location.latitude,
      longitude: location.longitude,
      bearing: location.bearing,
      bearing_accuracy_degrees: location.bearing_accuracy_degrees,
      speed: location.speed,
      speed_accuracy: location.speed_accuracy,
      provider: location.provider,
      battery: location.battery,
      charging: location.charging,
      created_at: location.created_at,
      updated_at: location.updated_at,
    }
  }
}
