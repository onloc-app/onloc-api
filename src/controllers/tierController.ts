import type { Response } from "express"
import type { Tier } from "../generated/prisma"
import type { AuthenticatedRequest } from "../middlewares/auth"
import prisma from "../prisma"
import { sanitizeData } from "../utils"

export const createTier = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user
    const tier: Tier = req.body

    if (!user.admin) {
      res.status(403).json({ message: "Forbidden" })
      return
    }

    const existingTier = await prisma.tier.findFirst({
      where: {
        name: tier.name,
      },
    })

    if (existingTier) {
      res
        .status(400)
        .json({ message: `Tier with name: ${tier.name}, already exists` })
      return
    }

    const newTier = await prisma.tier.create({
      data: {
        name: tier.name,
        max_devices: tier.max_devices,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

    res.status(201).json({ tier: sanitizeData(newTier) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not create tier" })
  }
}
