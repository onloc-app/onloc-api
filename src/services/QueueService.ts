import { FlashCommand } from "../commands/FlashCommand"
import { LockCommand } from "../commands/LockCommand"
import { RingCommand } from "../commands/RingCommand"

class RingQueue {
  private list: Array<bigint> = []

  public add(deviceId: bigint): void {
    if (!this.list.includes(deviceId)) {
      this.list.push(deviceId)
    }
  }

  public remove(deviceId: bigint): void {
    this.list = this.list.filter((id) => id !== deviceId)
  }

  public has(deviceId: bigint): boolean {
    return this.list.includes(deviceId)
  }
}

type LockQueueItem = {
  deviceId: bigint
  message: string | null
}

class LockQueue {
  private list: Array<LockQueueItem> = []

  public add(deviceId: bigint, message: string | null = null): void {
    if (!this.list.some((item) => item.deviceId === deviceId)) {
      this.list.push({ deviceId, message })
    }
  }

  public remove(deviceId: bigint): void {
    this.list = this.list.filter((item) => item.deviceId !== deviceId)
  }

  public has(deviceId: bigint): boolean {
    return this.list.some((item) => item.deviceId === deviceId)
  }

  public getMessage(deviceId: bigint): string | null {
    return this.list.find((item) => item.deviceId === deviceId)?.message ?? null
  }
}

class FlashQueue {
  private list: Array<bigint> = []

  public add(deviceId: bigint): void {
    if (!this.list.includes(deviceId)) {
      this.list.push(deviceId)
    }
  }

  public remove(deviceId: bigint): void {
    this.list = this.list.filter((id) => id !== deviceId)
  }

  public has(deviceId: bigint): boolean {
    return this.list.includes(deviceId)
  }
}

export class QueueService {
  readonly ringQueue = new RingQueue()
  readonly lockQueue = new LockQueue()
  readonly flashQueue = new FlashQueue()

  private constructor() {}
  private static readonly instance = new QueueService()
  static getInstance(): QueueService {
    return this.instance
  }

  sendQueuedCommands(deviceId: bigint) {
    if (this.ringQueue.has(deviceId)) {
      this.ringQueue.remove(deviceId)

      new RingCommand(deviceId).excute()

      console.log(`Sent queued ring to ${deviceId}`)
    }
    if (this.lockQueue.has(deviceId)) {
      this.lockQueue.remove(deviceId)

      const message = this.lockQueue.getMessage(deviceId)
      new LockCommand(deviceId, message).excute()

      console.log(`Sent queued lock to ${deviceId}`)
    }
    if (this.flashQueue.has(deviceId)) {
      this.flashQueue.remove(deviceId)

      new FlashCommand(deviceId).excute()

      console.log(`Sent queued flash to ${deviceId}`)
    }
  }
}
