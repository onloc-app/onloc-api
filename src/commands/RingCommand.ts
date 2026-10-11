import { RING_COMMAND } from "../types/Consts"
import { sendCommandToDeviceByPush } from "../utils"
import { Command } from "./Command"

export class RingCommand extends Command {
  private deviceId: bigint

  constructor(deviceId: bigint) {
    super()
    this.deviceId = deviceId
  }

  excute(): void {
    this.io.to(`device-${this.deviceId}`).emit(RING_COMMAND)
    sendCommandToDeviceByPush(this.deviceId, RING_COMMAND)
  }
}
