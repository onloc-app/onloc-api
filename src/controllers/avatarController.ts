import type { Response } from "express"
import fs from "fs"
import multer from "multer"
import path from "path"
import type { AuthenticatedRequest } from "../middlewares/auth"
import prisma from "../prisma"
import { sanitizeData } from "../utils"

const UPLOAD_URL = "uploads/avatars"

fs.mkdirSync(UPLOAD_URL, { recursive: true })

const storage = multer.diskStorage({
  destination: UPLOAD_URL,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const user = (req as AuthenticatedRequest).user!
    cb(null, `${user.id}-${Date.now()}${ext}`)
  },
})

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"]
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error("Invalid file type"))
    }
  },
})

export const upsertAvatar = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user!

    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" })
      return
    }

    const url = `${UPLOAD_URL}/${req.file.filename}`

    const existing = await prisma.avatar.findUnique({
      where: { user_id: user.id },
    })
    if (existing) {
      const oldPath = path.join(process.cwd(), existing.url)
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath)
    }

    const avatar = await prisma.avatar.upsert({
      where: { user_id: user.id },
      update: { url },
      create: {
        user_id: user.id,
        url,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

    res.status(200).json({ avatar: sanitizeData(avatar) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not upload avatar" })
  }
}

export const deleteAvatar = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user!

    const avatar = await prisma.avatar.findUnique({
      where: { user_id: user.id },
    })

    if (!avatar) {
      res.status(404).json({ message: "Avatar not found" })
      return
    }

    const filePath = path.join(process.cwd(), avatar.url)
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)

    await prisma.avatar.delete({ where: { user_id: user.id } })

    res.status(204).send()
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not delete avatar" })
  }
}
