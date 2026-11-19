import { Connection } from "@prisma/client"
import { UserWithAvatar } from "../../user/types/UserWithAvatar.js"

export interface ConnectionWithUsers extends Connection {
  requester: UserWithAvatar
  addressee: UserWithAvatar
}
