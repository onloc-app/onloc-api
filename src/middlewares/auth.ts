import type { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import type { ExtendedError, Socket } from "socket.io"
import { type users } from "../generated/prisma"
import prisma from "../prisma"

const JWT_SECRET =
  process.env.ACCESS_TOKEN_SECRET || "onloc-access-token-secret"

export interface AuthenticatedRequest extends Request {
  user: users
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
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
    const apiKey = await prisma.apiKeys.findFirst({
      where: {
        key: token,
      },
    })

    if (apiKey) {
      const user = await prisma.users.findFirst({
        where: {
          id: apiKey.user_id,
        },
      })
      if (user) {
        req.user = user
        next()
        return
      } else {
        res.status(401).json({ message: "User not found" })
        return
      }
    }

    const decoded = jwt.verify(token, JWT_SECRET)
    if (
      typeof decoded === "object" &&
      decoded !== null &&
      "userId" in decoded &&
      typeof (decoded as any).userId === "string"
    ) {
      const user = await prisma.users.findFirstOrThrow({
        where: { id: decoded.userId },
      })
      if (user) {
        req.user = user
        next()
        return
      } else {
        res.status(401).json({ message: "User not found" })
        return
      }
    } else {
      res.status(401).json({ message: "Invalid token payload" })
      return
    }
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" })
    return
  }
}

export const authenticateIO = (
  socket: Socket,
  next: (error?: ExtendedError) => void,
): void => {
  const token = socket.handshake.auth.token

  if (!token) {
    next(new Error("Invalid or expired token"))
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
      prisma.users
        .findUnique({
          where: { id: decoded.userId },
        })
        .then((user) => {
          if (!user) {
            next(new Error("User not found"))
            return
          }
          socket.data.user = user
          socket.join(`user_${user.id}`)
          if (user.admin) socket.join("admin")
          next()
          return
        })
        .catch(() => next(new Error("User not found")))
    } else {
      next(new Error("Invalid token payload"))
      return
    }
  } catch (error) {
    next(new Error("Invalid or expired token"))
    return
  }
}
