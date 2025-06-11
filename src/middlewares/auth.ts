import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { PrismaClient, type users } from "../generated/prisma"

const JWT_SECRET =
  process.env.ACCESS_TOKEN_SECRET || "onloc-access-token-secret"

export interface AuthenticatedRequest extends Request {
  user?: users
}

const prisma = new PrismaClient()

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized" })
    return
  }

  const token = authHeader.split(" ")[1]

  if (!token) {
    res.status(401).json({ message: "Unauthorized" })
    return
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    if (
      typeof decoded === "object" &&
      decoded !== null &&
      "userId" in decoded &&
      typeof (decoded as any).userId === "string"
    ) {
      const user = await prisma.users.findFirst({ where: { id: decoded.id } })
      req.user = !user ? undefined : user
      next()
    } else {
      res.status(401).json({ message: "Invalid token payload" })
    }
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" })
  }
}
