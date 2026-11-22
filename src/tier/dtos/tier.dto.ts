import { Tier } from "@prisma/client"

export class TierDto {
  id: string
  order_rank: number | null
  name: string
  max_devices: number | null
  created_at: Date
  updated_at: Date

  static from(tier: Tier): TierDto {
    return {
      id: tier.id.toString(),
      order_rank: tier.order_rank,
      name: tier.name,
      max_devices: tier.max_devices,
      created_at: tier.created_at,
      updated_at: tier.updated_at,
    }
  }
}
