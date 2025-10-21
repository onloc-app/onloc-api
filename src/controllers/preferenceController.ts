import { PrismaClient, type preferences } from "../generated/prisma"
import type { AuthenticatedRequest } from "../middlewares/auth"
import type { Response } from "express"
import { sanitizeData } from "../utils"

const prisma = new PrismaClient()

export const createPreference = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user
    const preference: preferences = req.body
    const user_id = BigInt(preference.user_id)

    if (user_id !== user.id) {
      res.status(401).json({ message: "Unauthorized" })
      return
    }

    const existingPreference = await prisma.preferences.findFirst({
      where: {
        user_id: user.id,
        key: preference.key,
      },
    })

    if (existingPreference) {
      res.status(400).json({ message: "Preference already exists" })
      return
    }

    const newPreference = await prisma.preferences.create({
      data: {
        user_id: user.id,
        key: preference.key,
        value: preference.value,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

    res.status(201).json({ preference: sanitizeData(newPreference) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not create preference" })
  }
}

export const readPreferences = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user
    const { key } = req.query

    const fetchPreferences = async () => {
      if (key) {
        return await prisma.preferences.findFirst({
          where: {
            user_id: BigInt(user.id),
            key: String(key),
          },
        })
      } else {
        return await prisma.preferences.findMany({
          where: {
            user_id: BigInt(user.id),
          },
        })
      }
    }

    const preferences = await fetchPreferences()

    if (!preferences) {
      res.status(404).json({ message: "Preferences not found" })
      return
    }

    res.status(200).json({ preferences: sanitizeData(preferences) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not read preferences" })
  }
}

export const readPreference = async (
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

    const preference = await prisma.preferences.findFirst({
      where: {
        id: BigInt(id),
        user_id: BigInt(user.id),
      },
    })

    if (!preference) {
      res.status(404).json({ message: "Preference not found" })
      return
    }

    res.status(201).json({ preference: sanitizeData(preference) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not read preference" })
  }
}

export const updatePreference = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user
    const preference: preferences = req.body
    const user_id = BigInt(preference.user_id)

    if (user_id !== user.id) {
      res.status(401).json({ message: "Unauthorized" })
      return
    }

    const existingPreference = await prisma.preferences.findFirst({
      where: {
        id: preference.id,
        user_id: user.id,
        key: preference.key,
      },
    })

    if (!existingPreference) {
      res.status(404).json({ message: "Preference not found" })
      return
    }

    const updatedPreference = await prisma.preferences.update({
      where: {
        id: preference.id,
        user_id: user.id,
        key: preference.key,
      },
      data: {
        ...preference,
        updated_at: new Date(),
      },
    })

    res.status(200).json({ preference: sanitizeData(updatedPreference) })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not update preference" })
  }
}

export const deletePreference = async (
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

    const preference = await prisma.preferences.findFirst({
      where: {
        id: BigInt(id),
        user_id: user.id,
      },
    })

    if (!preference) {
      res.status(404).json({ message: "Preference not found" })
      return
    }

    await prisma.preferences.delete({
      where: {
        id: preference.id,
      },
    })

    res.status(204).send()
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Could not delete preference" })
  }
}
