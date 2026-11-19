import { UserWithAvatarDto } from "../../user/dtos/user-with-avatar.dto.js"
import { ConnectionWithUsers } from "../types/ConnectionWithUsers.js"
import { ConnectionDto } from "./connection.dto.js"

export class ConnectionWithUsersDto extends ConnectionDto {
  requester: UserWithAvatarDto
  addressee: UserWithAvatarDto

  static from(connection: ConnectionWithUsers): ConnectionWithUsersDto {
    const requester = connection.requester
    const addressee = connection.addressee

    return Object.assign(ConnectionDto.from(connection), {
      requester: UserWithAvatarDto.from(requester),
      addressee: UserWithAvatarDto.from(addressee),
    })
  }
}
