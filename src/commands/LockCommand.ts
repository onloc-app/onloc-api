import { LOCK_COMMAND } from "../types/Consts"
import { sendCommandToDeviceByPush } from "../helpers/push"
import { Command } from "./Command"

export class LockCommand extends Command {
  private deviceId: bigint
  private message: string | null

  constructor(deviceId: bigint, message: string | null) {
    super()
    this.deviceId = deviceId
    this.message = message
  }

  excute(): void {
    this.io
      .to(`device-${this.deviceId}`)
      .emit(LOCK_COMMAND, { message: this.message })
    sendCommandToDeviceByPush(this.deviceId, LOCK_COMMAND, {
      message: this.message,
    })
  }
}
