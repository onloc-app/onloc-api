import cron from "node-cron"
import prisma from "../prisma"
import webpush from "web-push"

export async function scheduleCleanupPushProviders() {
  cron.schedule("*/15 * * * *", async () => {
    try {
      const providers = await prisma.unifiedPushProvider.findMany()

      const results = await Promise.all(
        providers.map(async (provider) => {
          try {
            if (!provider.pub_key || !provider.auth) {
              const res = await fetch(provider.endpoint_url, {
                method: "POST",
                headers: { "Content-Type": "text/plain" },
                body: "ping",
              })
              if (res.status === 404 || res.status === 410) {
                await prisma.unifiedPushProvider.delete({
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
                "ping",
              )
              return false
            }
          } catch (error: any) {
            if (error.statusCode === 404 || error.statusCode === 410) {
              await prisma.unifiedPushProvider.delete({
                where: { id: provider.id },
              })
              return true
            }
            console.error(
              `[cleanupPushProviders] check failed for ${provider.endpoint_url}`,
              error.statusCode ?? error,
            )
            return false
          }
        }),
      )

      const removed = results.filter(Boolean).length
      if (removed > 0) {
        console.log(
          `[cleanupPushProviders] removed ${removed} dead push provider(s)`,
        )
      }
    } catch (error) {
      console.error("[cleanupPushProviders] failed", error)
    }
  })
}
