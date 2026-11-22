import { Setting } from "@prisma/client"

export class SettingDto {
  id: string
  key: string
  value: string
  created_at: Date
  updated_at: Date

  static from(setting: Setting): SettingDto {
    return {
      id: setting.id.toString(),
      key: setting.key,
      value: setting.value,
      created_at: setting.created_at,
      updated_at: setting.updated_at,
    }
  }
}
