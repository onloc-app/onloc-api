import { UnifiedPushProvider } from "@prisma/client"

export class UnifiedPushProviderDto {
  id: string
  user_id: string
  device_id: string | null
  endpoint_url: string
  pub_key: string | null
  auth: string | null
  created_at: Date
  updated_at: Date

  static from(
    unifiedPushProvider: UnifiedPushProvider,
  ): UnifiedPushProviderDto {
    return {
      id: unifiedPushProvider.id.toString(),
      user_id: unifiedPushProvider.user_id.toString(),
      device_id: unifiedPushProvider.device_id?.toString() ?? null,
      endpoint_url: unifiedPushProvider.endpoint_url,
      pub_key: unifiedPushProvider.pub_key,
      auth: unifiedPushProvider.auth,
      created_at: unifiedPushProvider.created_at,
      updated_at: unifiedPushProvider.updated_at,
    }
  }
}
