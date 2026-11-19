import { ApiKey } from "@prisma/client"

export class ApiKeyDto {
  id: string
  user_id: string
  name: string
  key: string
  created_at: Date
  updated_at: Date

  static from(apiKey: ApiKey): ApiKeyDto {
    return {
      id: apiKey.id.toString(),
      user_id: apiKey.user_id.toString(),
      name: apiKey.name,
      key: apiKey.key,
      created_at: apiKey.created_at,
      updated_at: apiKey.updated_at,
    }
  }
}
