import type { Response } from "express"
import type { AuthenticatedRequest } from "../middlewares/auth"
import { sanitizeData } from "../utils"
import { Prisma, PrismaClient, type users } from "../generated/prisma"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export const readUser = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user
    res.status(200).json({ user: sanitizeData(user) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not read user" })
  }
}

export const updateUser = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user
    const body: Partial<users> = req.body

    if (body.username && body.username !== user.username) {
      const taken = await prisma.users.findUnique({
        where: { username: body.username },
      })
      if (taken) {
        res.status(400).json({ message: "Username already taken" })
        return
      }
    }

    if (typeof body.admin === "boolean" && !user.admin) {
      res.status(403).json({ message: "Forbidden" })
      return
    }

    const data: Prisma.usersUpdateInput = {}

    if (body.username) data.username = body.username
    if (body.password?.length) {
      data.password = await bcrypt.hash(body.password, 10)
    }
    if (typeof body.admin === "boolean" && user.admin) {
      data.admin = body.admin
    }
    data.updated_at = new Date()

    const updated = await prisma.users.update({
      where: { id: user.id },
      data,
    })

    res.status(200).json({ user: sanitizeData(updated) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not update user" })
  }
}

export const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user
    const { id } = req.params

    if (!id) {
      res.status(400).json({ message: "Id is missing" })
      return
    }

    if (BigInt(id) !== user.id && !user.admin) {
      res.status(403).json({ message: "Forbidden" })
      return
    }

    const userToDelete = await prisma.users.findFirst({
      where: {
        id: BigInt(id),
      },
    })

    if (!userToDelete) {
      res.status(404).json({ message: "User not found" })
      return
    }

    await prisma.users.delete({
      where: {
        id: BigInt(id),
      },
    })

    res.status(204)
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Could not delete user" })
  }
}
