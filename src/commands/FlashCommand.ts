import { FLASH_COMMAND } from "../types/Consts"
import { sendCommandToDeviceByPush } from "../utils"
import { Command } from "./Command"

export class FlashCommand extends Command {
  private deviceId: bigint

  constructor(deviceId: bigint) {
    super()
    this.deviceId = deviceId
  }

  excute(): void {
    this.io.to(`device-${this.deviceId}`).emit(FLASH_COMMAND)
    sendCommandToDeviceByPush(this.deviceId, FLASH_COMMAND)
  }
}
