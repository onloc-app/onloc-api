import { IsNotEmpty, IsNumberString } from "class-validator"

export class PostRejectConnectionRequestDto {
  @IsNumberString()
  @IsNotEmpty()
  id: string
}
