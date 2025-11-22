class RingQueue {
  private constructor() {}
  private static readonly instance = new RingQueue()
  static getInstance(): RingQueue {
    return this.instance
  }

  private list: Array<BigInt> = []

  public add(deviceId: BigInt): void {
    if (!this.list.includes(deviceId)) {
      this.list.push(deviceId)
    }
  }

  public remove(deviceId: BigInt): void {
    this.list = this.list.filter((id) => id !== deviceId)
  }

  public has(deviceId: BigInt): boolean {
    return this.list.includes(deviceId)
  }
}

export const ringQueue = RingQueue.getInstance()
