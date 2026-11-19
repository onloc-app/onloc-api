import { Injectable } from "@nestjs/common"

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

@Injectable()
export class QueueService {
  readonly ringQueue = new RingQueue()
  readonly lockQueue = new LockQueue()
  readonly flashQueue = new FlashQueue()
}
