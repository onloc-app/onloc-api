import { IsNotEmpty, IsNumberString } from "class-validator"

export class PostAcceptConnectionRequestDto {
  @IsNumberString()
  @IsNotEmpty()
  id: string
}
