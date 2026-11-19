import { Preference } from "@prisma/client"

export class PreferenceDto {
  id: string
  user_id: string
  key: string
  value: string
  created_at: Date
  updated_at: Date

  static from(preference: Preference): PreferenceDto {
    return {
      id: preference.id.toString(),
      user_id: preference.user_id.toString(),
      key: preference.key,
      value: preference.value,
      created_at: preference.created_at,
      updated_at: preference.updated_at,
    }
  }
}
