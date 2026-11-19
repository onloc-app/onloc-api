import { IsNotEmpty, IsNumberString } from "class-validator"

export class PostUserTierRequestDto {
  @IsNumberString()
  @IsNotEmpty()
  user_id: string

  @IsNumberString()
  @IsNotEmpty()
  tier_id: string
}
