import { Injectable, NotFoundException, PipeTransform } from "@nestjs/common"

@Injectable()
export class ParseBigIntPipe implements PipeTransform<string, bigint> {
  transform(value: string): bigint {
    try {
      return BigInt(value)
    } catch {
      throw new NotFoundException("Invalid ID")
    }
  }
}
