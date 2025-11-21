import prisma from "../prisma"

export async function isSetup(): Promise<boolean> {
  const admin = await prisma.users.findFirst({
    where: {
      admin: true,
    },
  })

  return !!admin
}

export async function isRegistrationEnabled(): Promise<boolean> {
  const registration = await prisma.settings.findFirst({
    where: {
      key: "registration",
      value: "true",
    },
  })

  return !!registration
}
