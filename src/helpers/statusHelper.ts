import { resolve } from "url"
import prisma from "../prisma"
import { readFileSync } from "fs"

export async function isSetup(): Promise<boolean> {
  const admin = await prisma.user.findFirst({
    where: {
      admin: true,
    },
  })

  return !!admin
}

export async function isRegistrationEnabled(): Promise<boolean> {
  const registration = await prisma.setting.findFirst({
    where: {
      key: "registration",
      value: "true",
    },
  })

  return !!registration
}

export function getAPIVersion(): string {
  const { version } = JSON.parse(
    readFileSync(resolve(__dirname, "../package.json"), "utf-8"),
  )
  return version
}
