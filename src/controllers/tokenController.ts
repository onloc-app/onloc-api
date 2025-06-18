import type { Response } from "express"
import type { AuthenticatedRequest } from "../middlewares/auth"
import { PrismaClient } from "../generated/prisma"
import { sanitizeData } from "../utils"

const prisma = new PrismaClient()

export const readTokens = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user

    const tokens = await prisma.refreshTokens.findMany({
      where: {
        user_id: user.id,
      },
    })

    res.status(200).json({ tokens: sanitizeData(tokens) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not read tokens" })
  }
}

export const deleteToken = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user
    const { id } = req.params

    if (!id) {
      res.status(400).json({ message: "Id is missing" })
      return
    }

    const deleted = await prisma.refreshTokens.delete({
      where: {
        id: BigInt(id),
        user_id: user.id,
      },
    })

    if (!deleted) {
      res.status(404).json({ message: "Token not found" })
      return
    }

    res.status(204).send()
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not delete token" })
  }
}

export const deleteTokenWithBody = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user
    const { refreshToken } = req.body

    if (!refreshToken) {
      res.status(400).json({ message: "Token is missing" })
      return
    }

    const deleted = await prisma.refreshTokens.delete({
      where: {
        token: refreshToken,
        user_id: user.id,
      },
    })

    if (!deleted) {
      res.status(404).json({ message: "Token not found" })
      return
    }

    res.status(204).send()
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not delete token" })
  }
}
