import { Connection } from "@prisma/client"
import { UserWithAvatar } from "../../user/types/UserWithAvatar"

export interface ConnectionWithUsers extends Connection {
  requester: UserWithAvatar
  addressee: UserWithAvatar
}
