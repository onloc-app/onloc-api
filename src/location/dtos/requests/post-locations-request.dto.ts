import { ArrayNotEmpty, IsArray, ValidateNested } from "class-validator"
import { PostLocationRequestDto } from "./post-location-request.dto.js"
import { Type } from "class-transformer"

export class PostLocationsRequestDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => PostLocationRequestDto)
  locations: PostLocationRequestDto[]
}
