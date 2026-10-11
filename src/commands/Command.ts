import { getIO } from "../socket"

export abstract class Command {
  protected io

  constructor() {
    this.io = getIO()
  }

  excute(): void {}
}
