import prisma from "../prisma"

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
