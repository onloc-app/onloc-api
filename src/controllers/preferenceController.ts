import type { Response } from "express"
import { type Preference } from "../generated/prisma"
import type { AuthenticatedRequest } from "../middlewares/auth"
import prisma from "../prisma"
import { sanitizeData } from "../utils"

export const createPreference = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user!
    const preference: Preference = req.body
    const user_id = BigInt(preference.user_id)

    if (user_id !== user.id) {
      res.status(401).json({ message: "Unauthorized" })
      return
    }

    const existingPreference = await prisma.preference.findFirst({
      where: {
        user_id: user.id,
        key: preference.key,
      },
    })

    if (existingPreference) {
      res.status(400).json({ message: "Preference already exists" })
      return
    }

    const newPreference = await prisma.preference.create({
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
  res: Response,
): Promise<void> => {
  try {
    const user = req.user!
    const { key } = req.query

    const fetchPreferences = async () => {
      if (key) {
        const preference = await prisma.preference.findFirst({
          where: {
            user_id: BigInt(user.id),
            key: String(key),
          },
        })
        return [preference]
      } else {
        return await prisma.preference.findMany({
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
  res: Response,
): Promise<void> => {
  try {
    const user = req.user!
    const { id } = req.params

    if (!id) {
      res.status(400).json({ message: "Id is missing" })
      return
    }

    const preference = await prisma.preference.findFirst({
      where: {
        id: BigInt(id as string),
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
  res: Response,
): Promise<void> => {
  try {
    const user = req.user!
    const preference: Preference = req.body
    const user_id = BigInt(preference.user_id)

    if (user_id !== user.id) {
      res.status(401).json({ message: "Unauthorized" })
      return
    }

    const existingPreference = await prisma.preference.findFirst({
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

    const updatedPreference = await prisma.preference.update({
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
  res: Response,
): Promise<void> => {
  try {
    const user = req.user!
    const { id } = req.params

    if (!id) {
      res.status(400).json({ message: "Id is missing" })
      return
    }

    const preference = await prisma.preference.findFirst({
      where: {
        id: BigInt(id as string),
        user_id: user.id,
      },
    })

    if (!preference) {
      res.status(404).json({ message: "Preference not found" })
      return
    }

    await prisma.preference.delete({
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
