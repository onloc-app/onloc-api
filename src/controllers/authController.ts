import type { Request, Response } from "express"
import bcrypt from "bcryptjs"
import jwt, { type JwtPayload } from "jsonwebtoken"
import { PrismaClient } from "../generated/prisma"
import { sanitizeData } from "../utils"

const prisma = new PrismaClient()

const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET || "onloc-access-token-secret"
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "onloc-refresh-token-secret"

const generateAccessToken = (userId: string) => {
  return jwt.sign({ userId }, ACCESS_TOKEN_SECRET, { expiresIn: "1h" })
}

const generateRefreshToken = (userId: string) => {
  return jwt.sign({ userId }, REFRESH_TOKEN_SECRET, { expiresIn: "1y" })
}

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body
  const agent = req.headers["user-agent"]

  try {
    const user = await prisma.users.findFirst({
      where: {
        username: username,
      },
    })
    if (!user) {
      res.status(401).json({ message: "Invalid credentials" })
      return
    }

    // Validate the password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid credentials" })
      return
    }

    // Generate the tokens
    const accessToken = generateAccessToken(user.id.toString())
    const refreshToken = generateRefreshToken(user.id.toString())

    // Store the refresh token
    await prisma.refreshTokens.create({
      data: {
        token: refreshToken,
        user_id: user.id,
        agent,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

    res.status(200).json({
      user: sanitizeData(user),
      accessToken,
      refreshToken,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Error logging in" })
  }
}

export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { username, password } = req.body
  const agent = req.headers["user-agent"]

  if (!username || !password) {
    res
      .status(400)
      .json({ message: "Username and password fields are required" })
    return
  }

  try {
    const existingUser = await prisma.users.findFirst({
      where: {
        username: username,
      },
    })

    if (existingUser) {
      res.status(400).json({ message: "Username already taken" })
      return
    }

    const existingAdmin = await prisma.users.findFirst({
      where: {
        admin: true,
      },
    })

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await prisma.users.create({
      data: {
        username,
        password: hashedPassword,
        admin: !!existingAdmin ? false : true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

    // Generate the tokens
    const accessToken = generateAccessToken(newUser.id.toString())
    const refreshToken = generateRefreshToken(newUser.id.toString())

    // Store the refresh token
    await prisma.refreshTokens.create({
      data: {
        token: refreshToken,
        user_id: newUser.id,
        agent,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

    res.status(201).json({
      user: sanitizeData(newUser),
      accessToken,
      refreshToken,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Error registering" })
  }
}

export const refreshAccessToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { refreshToken } = req.body

  if (!refreshToken) {
    res.status(401).json({ message: "Refresh token is required" })
    return
  }

  const tokenRecord = await prisma.refreshTokens.update({
    where: { token: refreshToken },
    data: {
      updated_at: new Date(),
    },
  })

  if (!tokenRecord) {
    res.status(403).json({ message: "Invalid refresh token" })
    return
  }

  jwt.verify(
    refreshToken,
    REFRESH_TOKEN_SECRET,
    (
      error: jwt.VerifyErrors | null,
      decoded: string | JwtPayload | undefined
    ) => {
      if (error) {
        res.status(403).json({ message: "Invalid refresh token" })
        return
      }

      const accessToken = generateAccessToken((decoded as any).userId)

      res.status(200).json({
        accessToken,
      })
    }
  )
}
