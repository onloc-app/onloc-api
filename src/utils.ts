import type { UnifiedPushProvider } from "./generated/prisma"
import prisma from "./prisma"
import webpush from "web-push"

export function sanitizeData(data: unknown) {
  return JSON.parse(
    JSON.stringify(data, (key, value) => {
      if (key === "password") return undefined
      if (typeof value === "bigint") return value.toString()
      return value
    }),
  )
}

export async function sendCommandByPush(
  provider: UnifiedPushProvider,
  command: string,
  args?: Record<string, unknown>,
) {
  const payload = JSON.stringify({ command: command, ...args })

  try {
    if (!provider.pub_key || !provider.auth) {
      await fetch(provider.endpoint_url, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: payload,
      })
    } else {
      await webpush.sendNotification(
        {
          endpoint: provider.endpoint_url,
          keys: { p256dh: provider.pub_key, auth: provider.auth },
        },
        payload,
      )
    }
  } catch (error: any) {
    console.error(error)
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
