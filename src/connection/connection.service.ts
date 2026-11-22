import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common"
import { ConnectionStatus } from "@prisma/client"
import type { Connection } from "@prisma/client"
import { PrismaService } from "../prisma/prisma.service.js"
import { ConnectionWithUsers } from "./types/ConnectionWithUsers.js"

@Injectable()
export class ConnectionService {
  constructor(private readonly prisma: PrismaService) {}

  async sendRequest(
    requesterId: bigint,
    addresseeId: bigint,
  ): Promise<{ connection: Connection; created: boolean }> {
    const existing = await this.prisma.connection.findFirst({
      where: {
        OR: [
          { requester_id: requesterId, addressee_id: addresseeId },
          { requester_id: addresseeId, addressee_id: requesterId },
        ],
      },
    })

    if (existing) {
      if (existing.status !== ConnectionStatus.REJECTED) {
        throw new BadRequestException("Connection already exists")
      }

      const connection = await this.prisma.connection.update({
        where: { id: existing.id },
        data: {
          requester_id: requesterId,
          addressee_id: addresseeId,
          status: ConnectionStatus.PENDING,
        },
      })
      return { connection: connection, created: false }
    }

    const connection = await this.prisma.connection.create({
      data: {
        requester_id: requesterId,
        addressee_id: addresseeId,
        status: ConnectionStatus.PENDING,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })
    return { connection: connection, created: true }
  }

  async accept(id: bigint, userId: bigint): Promise<Connection> {
    const connection = await this.prisma.connection.findUnique({
      where: { id },
    })
    if (!connection) {
      throw new NotFoundException("Connection not found")
    }
    if (userId !== connection.addressee_id) {
      throw new ForbiddenException()
    }

    return await this.prisma.connection.update({
      where: { id },
      data: { status: ConnectionStatus.ACCEPTED },
    })
  }

  async reject(id: bigint, userId: bigint): Promise<Connection> {
    const connection = await this.prisma.connection.findUnique({
      where: { id },
    })
    if (!connection) {
      throw new NotFoundException("Connection not found")
    }
    if (
      userId !== connection.addressee_id &&
      userId !== connection.requester_id
    ) {
      throw new ForbiddenException()
    }

    const rejectedConnection = await this.prisma.connection.update({
      where: { id },
      data: { status: ConnectionStatus.REJECTED },
    })
    await this.prisma.deviceShare.deleteMany({
      where: { connection_id: rejectedConnection.id },
    })
    return rejectedConnection
  }

  async findAll(userId: bigint): Promise<ConnectionWithUsers[]> {
    return await this.prisma.connection.findMany({
      where: {
        OR: [{ requester_id: userId }, { addressee_id: userId }],
      },
      include: {
        requester: { include: { avatar: true } },
        addressee: { include: { avatar: true } },
      },
    })
  }
}
