import type { Response } from "express"
import type { AuthenticatedRequest } from "../middlewares/auth"
import { PrismaClient, type settings } from "../generated/prisma"
import { sanitizeData } from "../utils"

const prisma = new PrismaClient()

export const createSetting = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user
    const setting: settings = req.body

    if (!user.admin) {
      res.status(403).json({ message: "Forbidden" })
      return
    }

    const existingSetting = await prisma.settings.findFirst({
      where: {
        key: setting.key,
      },
    })

    if (existingSetting) {
      res.status(400).json({ message: "Setting already exists" })
      return
    }

    const newSetting = await prisma.settings.create({
      data: {
        key: setting.key,
        value: setting.value,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

    res.status(201).json({ setting: sanitizeData(newSetting) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not create setting" })
  }
}

export const readSettings = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user

    if (!user.admin) {
      res.status(403).json({ message: "Forbidden" })
      return
    }

    const settings = await prisma.settings.findMany()

    if (!settings) {
      res.status(404).json({ message: "Settings not found" })
      return
    }

    res.status(200).json({ settings: sanitizeData(settings) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not read settings" })
  }
}

export const readSetting = async (
  req: AuthenticatedRequest,
  res: Response
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

    const setting = await prisma.settings.findFirst({
      where: {
        id: BigInt(id),
      },
    })

    if (!setting) {
      res.status(404).json({ message: "Setting not found" })
      return
    }

    res.status(201).json({ setting: sanitizeData(setting) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not read setting" })
  }
}

export const updateSetting = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user
    const setting: settings = req.body

    if (!user.admin) {
      res.status(403).json({ message: "Forbidden" })
      return
    }

    const existingSetting = await prisma.settings.findFirst({
      where: {
        id: setting.id,
        key: setting.key,
      },
    })

    if (!existingSetting) {
      res.status(404).json({ message: "Setting not found" })
      return
    }

    const updatedSetting = await prisma.settings.update({
      where: {
        id: setting.id,
        key: setting.key,
      },
      data: {
        ...setting,
        updated_at: new Date(),
      },
    })

    res.status(200).json({ setting: sanitizeData(updatedSetting) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not update setting" })
  }
}

export const deleteSetting = async (
  req: AuthenticatedRequest,
  res: Response
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

    const setting = await prisma.settings.findFirst({
      where: { id: BigInt(id) },
    })

    if (!setting) {
      res.status(404).json({ message: "Setting not found" })
      return
    }

    await prisma.settings.delete({
      where: {
        id: setting.id,
      },
    })

    res.status(204).send()
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not delete setting" })
  }
}
