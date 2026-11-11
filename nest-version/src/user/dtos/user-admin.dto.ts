import { Tier } from "@prisma/client"
import { UserDto } from "./user.dto"

export class UserAdminDto extends UserDto {
  tier: Tier | null // TODO: change to DTO
  number_of_devices: number
  number_of_locations: number
}
