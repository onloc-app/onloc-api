import crypto from "crypto"
import type { Response } from "express"
import type { AuthenticatedRequest } from "../middlewares/auth"
import prisma from "../prisma"
import { sanitizeData } from "../utils"

export const createApiKey = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user
    const { name } = req.body

    const newApiKey = await prisma.apiKeys.create({
      data: {
        user_id: user.id,
        name: name,
        key: crypto.randomBytes(32).toString("hex"),
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

    res.status(201).json({ apiKey: sanitizeData(newApiKey) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not create api key" })
  }
}

export const readApiKeys = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user

    const apiKeys = await prisma.apiKeys.findMany({
      where: {
        user_id: user.id,
      },
    })

    res.status(200).json({ apiKeys: sanitizeData(apiKeys) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not read api keys" })
  }
}

export const deleteApiKeys = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user
    const { id } = req.params

    if (!id) {
      res.status(400).json({ message: "Id is missing" })
      return
    }

    const deleted = await prisma.apiKeys.delete({
      where: {
        id: BigInt(id),
        user_id: user.id,
      },
    })

    if (!deleted) {
      res.status(404).json({ message: "Api key not found" })
      return
    }

    res.status(204).send()
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not delete api key" })
  }
}
