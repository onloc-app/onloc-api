import { IsNotEmpty, IsString } from "class-validator"

export class PostUserTierRequestDto {
  @IsString()
  @IsNotEmpty()
  user_id: string

  @IsString()
  @IsNotEmpty()
  tier_id: string
}
