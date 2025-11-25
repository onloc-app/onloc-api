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
        .json({ message: `Tier with name "${tier.name}" already exists` })
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

export const readTiers = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user

    if (!user.admin) {
      res.status(403).json({ message: "Forbidden" })
      return
    }

    const tiers = await prisma.tier.findMany()

    res.status(200).json({ tiers: sanitizeData(tiers) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not read tiers" })
  }
}

export const readTier = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user
    const { id } = req.params

    if (!user.admin) {
      res.status(403).json({ message: "Forbidden" })
      return
    }

    if (!id) {
      res.status(400).json({ message: "Id is missing" })
      return
    }

    const tier = await prisma.tier.findFirst({
      where: {
        id: BigInt(id),
      },
    })

    if (!tier) {
      res.status(404).json({ message: "Tier not found" })
      return
    }

    res.status(200).json({ tier: sanitizeData(tier) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not read tier" })
  }
}

export const updateTier = async (
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

    if (!tier.id) {
      res.status(400).json({ message: "Id is missing" })
      return
    }

    const existingTier = await prisma.tier.findFirst({
      where: {
        id: tier.id,
      },
    })

    if (!existingTier) {
      res.status(404).json({ message: "Tier not found" })
      return
    }

    const existingName = await prisma.tier.findFirst({
      where: {
        name: tier.name,
      },
    })

    if (existingName && existingName.id !== existingTier.id) {
      res
        .status(400)
        .json({ message: `Tier with name "${tier.name}" already exists` })
      return
    }

    const updated = await prisma.tier.update({
      where: {
        id: tier.id,
      },
      data: {
        name: tier.name,
        max_devices: tier.max_devices,
        updated_at: new Date(),
      },
    })

    res.status(200).json({ tier: sanitizeData(updated) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not update tier" })
  }
}

export const deleteTier = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user
    const { id } = req.params

    if (!user.admin) {
      res.status(403).json({ message: "Forbidden" })
      return
    }

    if (!id) {
      res.status(400).json({ message: "Id is missing" })
      return
    }

    const deleted = await prisma.tier.delete({
      where: {
        id: BigInt(id),
      },
    })

    if (!deleted) {
      res.status(404).json({ message: "Tier not found" })
      return
    }

    res.status(204).send()
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not delete tier" })
  }
}
