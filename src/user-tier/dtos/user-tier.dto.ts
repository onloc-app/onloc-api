import { UserTier } from "@prisma/client"

export class UserTierDto {
  id: string
  user_id: string
  tier_id: string
  created_at: Date
  updated_at: Date

  static from(userTier: UserTier): UserTierDto {
    return {
      id: userTier.id.toString(),
      user_id: userTier.user_id.toString(),
      tier_id: userTier.tier_id.toString(),
      created_at: userTier.created_at,
      updated_at: userTier.updated_at,
    }
  }
}
