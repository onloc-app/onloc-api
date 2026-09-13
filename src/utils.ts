import type { UnifiedPushProvider } from "./generated/prisma"
import prisma from "./prisma"
import webpush, { WebPushError } from "web-push"

export function sanitizeData(data: unknown) {
  return JSON.parse(
    JSON.stringify(data, (key, value) => {
      if (key === "password") return undefined
      if (typeof value === "bigint") return value.toString()
      return value
    }),
  )
}

// Returns true or false depending on whether the command reached the provider.
export async function sendCommandByPush(
  provider: UnifiedPushProvider,
  command: string,
  args?: Record<string, unknown>,
): Promise<boolean> {
  const payload = JSON.stringify({ command: command, ...args })

  try {
    if (!provider.pub_key || !provider.auth) {
      const res = await fetch(provider.endpoint_url, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: payload,
      })
      if (res.status === 404 || res.status === 410) {
        await prisma.unifiedPushProvider.deleteMany({
          where: { id: provider.id },
        })
        return true
      }
      return false
    } else {
      await webpush.sendNotification(
        {
          endpoint: provider.endpoint_url,
          keys: { p256dh: provider.pub_key, auth: provider.auth },
        },
        payload,
      )
      return false
    }
  } catch (error) {
    if (error instanceof WebPushError) {
      if (error.statusCode === 404 || error.statusCode === 410) {
        await prisma.unifiedPushProvider.deleteMany({
          where: { id: provider.id },
        })
        return true
      }
      console.error(error)
    }
    return false
  }
}

export async function sendCommandToDeviceByPush(
  deviceId: bigint,
  command: string,
  args?: Record<string, unknown>,
) {
  const providers = await prisma.unifiedPushProvider.findMany({
    where: { device_id: deviceId },
  })
  await Promise.all(
    providers.map((provider) => {
      sendCommandByPush(provider, command, args)
    }),
  )
}
