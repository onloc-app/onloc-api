import { Tier } from "@prisma/client"
import { UserWithAvatar } from "./UserWithAvatar"

export interface UserAdmin extends UserWithAvatar {
  tier: Tier | null
  number_of_devices: number
  number_of_locations: number
}
