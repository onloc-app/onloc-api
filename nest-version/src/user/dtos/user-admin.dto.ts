import { Tier } from "@prisma/client"
import { UserWithAvatarDto } from "./user-with-avatar.dto.js"
import { UserAdmin } from "../types/UserAdmin.js"

export class UserAdminDto extends UserWithAvatarDto {
  tier: Tier | null // TODO: change to DTO
  number_of_devices: number
  number_of_locations: number

  static from(user: UserAdmin): UserAdminDto {
    return Object.assign(UserWithAvatarDto.from(user), {
      tier: user.tier,
      number_of_devices: user.number_of_devices,
      number_of_locations: user.number_of_locations,
    })
  }
}
