import { FlashCommand } from "../commands/FlashCommand"
import { LockCommand } from "../commands/LockCommand"
import { RingCommand } from "../commands/RingCommand"
import { flashQueue } from "../services/flashQueue"
import { lockQueue } from "../services/lockQueue"
import { ringQueue } from "../services/ringQueue"

export function sendQueuedCommands(deviceId: bigint) {
  if (ringQueue.has(deviceId)) {
    ringQueue.remove(deviceId)

    new RingCommand(deviceId).excute()

    console.log(`Sent queued ring to ${deviceId}`)
  }
  if (lockQueue.has(deviceId)) {
    lockQueue.remove(deviceId)

    const message = lockQueue.getMessage(deviceId)
    new LockCommand(deviceId, message).excute()

    console.log(`Sent queued lock to ${deviceId}`)
  }
  if (flashQueue.has(deviceId)) {
    flashQueue.remove(deviceId)

    new FlashCommand(deviceId).excute()

    console.log(`Sent queued flash to ${deviceId}`)
  }
}
