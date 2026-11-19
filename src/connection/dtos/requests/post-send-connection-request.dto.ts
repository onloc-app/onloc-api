import { IsNotEmpty, IsNumberString } from "class-validator"

export class PostSendConnectionRequestDto {
  @IsNumberString()
  @IsNotEmpty()
  addressee_id: string
}
