import cron from "node-cron"
import prisma from "../prisma"
import { sendCommandByPush } from "../helpers/push"

export async function scheduleCleanupPushProviders() {
  cron.schedule("*/15 * * * *", async () => {
    try {
      const providers = await prisma.unifiedPushProvider.findMany()

      const results = await Promise.all(
        providers.map(async (provider) => {
          return sendCommandByPush(provider, "ping")
        }),
      )

      const removed = results.filter((r) => r === false).length
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
