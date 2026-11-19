import { Type } from "class-transformer"
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumberString,
  ValidateNested,
} from "class-validator"

export class ReorderTierItemDto {
  @IsNumberString()
  @IsNotEmpty()
  id: string

  @IsInt()
  order_rank: number
}

export class PostReorderTiersRequestDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ReorderTierItemDto)
  tiers: ReorderTierItemDto[]
}
