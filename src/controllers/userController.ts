import bcrypt from "bcryptjs"
import type { Response } from "express"
import { Prisma, type User } from "../generated/prisma"
import type { AuthenticatedRequest } from "../middlewares/auth"
import prisma from "../prisma"
import { sanitizeData } from "../utils"

type UserSafe = Omit<User, "password">
interface UserExtra extends UserSafe {
  number_of_devices: number
  number_of_locations: number
}

export const readUsers = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const reqUser = req.user

    if (!reqUser.admin) {
      res.status(403).json({ message: "Forbidden" })
      return
    }

    const rawUsers = await prisma.user.findMany({
      include: {
        userTiers: {
          include: {
            tier: true,
          },
        },
        devices: {
          select: {
            id: true,
            locations: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    })

    const users: UserExtra[] = await Promise.all(
      rawUsers.map(async (user) => {
        return {
          id: user.id,
          username: user.username,
          admin: user.admin,
          created_at: user.created_at,
          updated_at: user.updated_at,
          tier: user.userTiers[0]?.tier ?? null,
          number_of_devices: user.devices.length,
          number_of_locations: user.devices.reduce(
            (sum, device) => sum + device.locations.length,
            0,
          ),
        }
      }),
    )

    res.status(200).json({ users: sanitizeData(users) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not read users" })
  }
}

export const readUser = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const reqUser = req.user
    const { id } = req.params

    if (!id) {
      res.status(400).json({ message: "Id is missing" })
      return
    }

    if (BigInt(id) !== reqUser.id && !reqUser.admin) {
      res.status(403).json({ message: "Forbidden" })
      return
    }

    const user = await prisma.user.findFirst({
      where: {
        id: BigInt(id),
      },
    })

    res.status(200).json({ user: sanitizeData(user) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not read user" })
  }
}

export const readUserInfo = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user

    const userTier = await prisma.userTier.findFirst({
      where: {
        user_id: user.id,
      },
      include: {
        tier: true,
      },
    })

    const userExtra = {
      ...user,
      tier: userTier?.tier,
    }

    res.status(200).json({ user: sanitizeData(userExtra) })
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
    const body: Partial<User> = req.body

    if (body.username && body.username !== user.username) {
      const taken = await prisma.user.findUnique({
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

    const data: Prisma.UserUpdateInput = {}

    if (body.username) data.username = body.username
    if (body.password?.length) {
      data.password = await bcrypt.hash(body.password, 10)
    }
    if (typeof body.admin === "boolean" && user.admin) {
      data.admin = body.admin
    }
    data.updated_at = new Date()

    const updated = await prisma.user.update({
      where: { id: user.id },
      data,
    })

    res.status(200).json({ user: sanitizeData(updated) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not update user" })
  }
}

export const deleteUser = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const reqUser = req.user
    const { id } = req.params

    if (!id) {
      res.status(400).json({ message: "Id is missing" })
      return
    }

    if (BigInt(id) !== reqUser.id && !reqUser.admin) {
      res.status(403).json({ message: "Forbidden" })
      return
    }

    const user = await prisma.user.findFirst({
      where: {
        id: BigInt(id),
      },
    })

    if (!user) {
      res.status(404).json({ message: "User not found" })
      return
    }

    await prisma.user.delete({
      where: {
        id: BigInt(id),
      },
    })

    res.status(204).send()
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not delete user" })
  }
}
