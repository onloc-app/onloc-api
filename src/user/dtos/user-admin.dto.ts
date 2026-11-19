import { TierDto } from "../../tier/dtos/tier.dto.js"
import { UserWithAvatarDto } from "./user-with-avatar.dto.js"
import { UserAdmin } from "../types/UserAdmin.js"

export class UserAdminDto extends UserWithAvatarDto {
  tier: TierDto | null
  number_of_devices: number
  number_of_locations: number

  static from(user: UserAdmin): UserAdminDto {
    return Object.assign(UserWithAvatarDto.from(user), {
      tier: user.tier ? TierDto.from(user.tier) : null,
      number_of_devices: user.number_of_devices,
      number_of_locations: user.number_of_locations,
    })
  }
}
