import type { Connection, ConnectionStatus } from "@prisma/client"

export class ConnectionDto {
  id: string
  requester_id: string
  addressee_id: string
  status: ConnectionStatus
  created_at: Date
  updated_at: Date

  static from(connection: Connection): ConnectionDto {
    return {
      id: connection.id.toString(),
      requester_id: connection.requester_id.toString(),
      addressee_id: connection.addressee_id.toString(),
      status: connection.status,
      created_at: connection.created_at,
      updated_at: connection.updated_at,
    }
  }
}
