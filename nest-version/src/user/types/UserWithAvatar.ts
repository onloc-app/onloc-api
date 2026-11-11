import { Avatar, User } from "@prisma/client"

export interface UserWithAvatar extends User {
  avatar: Avatar | null
}
