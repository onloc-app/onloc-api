class FlashQueue {
  private constructor() {}
  private static readonly instance = new FlashQueue()
  static getInstance(): FlashQueue {
    return this.instance
  }

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

export const flashQueue = FlashQueue.getInstance()
