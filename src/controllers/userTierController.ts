import type { Response } from "express"
import type { AuthenticatedRequest } from "../middlewares/auth"
import type { UserTier } from "../generated/prisma"
import prisma from "../prisma"
import { sanitizeData } from "../utils"

export const createUserTier = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const reqUser = req.user
    const userTier: UserTier = req.body

    if (!reqUser.admin) {
      res.status(403).json({ message: "Forbidden" })
      return
    }

    const user = await prisma.user.findFirst({
      where: {
        id: userTier.user_id,
      },
    })

    if (!user) {
      res.status(404).json({ message: "User not found" })
      return
    }

    if (user?.admin) {
      res.status(400).json({ message: "Admins cannot have tiers" })
      return
    }

    const existingLink = await prisma.userTier.findFirst({
      where: {
        user_id: userTier.user_id,
      },
    })

    if (existingLink) {
      const updatedUserTier = await prisma.userTier.update({
        where: {
          id: existingLink.id,
        },
        data: {
          user_id: userTier.user_id,
          tier_id: userTier.tier_id,
          updated_at: new Date(),
        },
      })
      res.status(201).json({ user_tier: sanitizeData(updatedUserTier) })
    } else {
      const newUserTier = await prisma.userTier.create({
        data: {
          user_id: userTier.user_id,
          tier_id: userTier.tier_id,
          created_at: new Date(),
          updated_at: new Date(),
        },
      })
      res.status(201).json({ user_tier: sanitizeData(newUserTier) })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not create user-tier" })
  }
}

export const readUserTiers = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user

    if (!user.admin) {
      res.status(403).json({ message: "Forbidden" })
      return
    }

    const userTiers = await prisma.userTier.findMany()

    res.status(200).json({ user_tiers: userTiers })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not read user-tiers" })
  }
}
