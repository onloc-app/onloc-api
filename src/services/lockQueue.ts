type LockQueueItem = {
  deviceId: bigint
  message: string | null
}

class LockQueue {
  private constructor() {}
  private static readonly instance = new LockQueue()
  static getInstance(): LockQueue {
    return this.instance
  }

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

export const lockQueue = LockQueue.getInstance()
