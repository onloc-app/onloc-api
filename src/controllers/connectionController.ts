import type { Response } from "express"
import type { AuthenticatedRequest } from "../middlewares/auth"
import { ConnectionStatus, type Connection } from "../generated/prisma"
import prisma from "../prisma"
import { sanitizeData } from "../utils"
import type { UserMin } from "./userController"

interface ConnectionExtra extends Connection {
  user: UserMin | null
}

export const sendConnectionRequest = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user!
    const { addressee_id } = req.body

    const existingConnection = await prisma.connection.findFirst({
      where: {
        OR: [
          { requester_id: user.id, addressee_id: addressee_id },
          { requester_id: addressee_id, addressee_id: user.id },
        ],
      },
    })
    if (existingConnection) {
      if (existingConnection.status === ConnectionStatus.REJECTED) {
        const updatedConnection = await prisma.connection.update({
          where: {
            id: existingConnection.id,
          },
          data: {
            requester_id: user.id,
            addressee_id: addressee_id,
            status: "PENDING",
          },
        })
        res.status(200).json({ connection: sanitizeData(updatedConnection) })
      }
      res.status(400).json({ message: "Connection already exists" })
      return
    }

    const newConnection = await prisma.connection.create({
      data: {
        requester_id: user.id,
        addressee_id: addressee_id,
        status: "PENDING",
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

    res.status(201).send({ connection: sanitizeData(newConnection) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not send connection request" })
  }
}

export const acceptConnectionRequest = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user!
    const { id } = req.body

    const connection = await prisma.connection.findFirst({
      where: {
        id: id,
      },
    })

    if (!connection) {
      res.status(404).send({ message: "Connection request not found" })
      return
    }

    if (user.id !== connection.addressee_id) {
      res.status(403).send({ message: "Unauthorized" })
      return
    }

    const updatedConnection = await prisma.connection.update({
      where: {
        id: id,
      },
      data: {
        status: ConnectionStatus.ACCEPTED,
      },
    })

    res.status(200).json({ connection: sanitizeData(updatedConnection) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not accept connection request" })
  }
}

export const rejectConnectionRequest = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user!
    const { id } = req.body

    const connection = await prisma.connection.findFirst({
      where: {
        id: id,
      },
    })

    if (!connection) {
      res.status(404).send({ message: "Connection request not found" })
      return
    }

    if (
      user.id !== connection.addressee_id &&
      user.id !== connection.requester_id
    ) {
      res.status(403).send({ message: "Unauthorized" })
      return
    }

    const updatedConnection = await prisma.connection.update({
      where: {
        id: id,
      },
      data: {
        status: ConnectionStatus.REJECTED,
      },
    })

    // Delete associated shared devices
    await prisma.deviceShare.deleteMany({
      where: {
        connection_id: updatedConnection.id,
      },
    })

    res.status(200).json({ connection: sanitizeData(updatedConnection) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not reject connection request" })
  }
}

export const readConnections = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user!

    const rawConnections = await prisma.connection.findMany({
      where: {
        OR: [{ requester_id: user.id }, { addressee_id: user.id }],
      },
      include: {
        requester: { include: { avatar: true } },
        addressee: { include: { avatar: true } },
      },
    })

    const connections: ConnectionExtra[] = rawConnections.map((connection) => {
      const otherUser =
        connection.requester_id === user.id
          ? connection.addressee
          : connection.requester
      return {
        ...connection,
        user: {
          id: otherUser.id,
          username: otherUser.username,
          avatar: otherUser.avatar,
        },
      }
    })

    res.status(200).send({ connections: sanitizeData(connections) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not read connections" })
  }
}
