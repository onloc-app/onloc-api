import { Param } from "@nestjs/common"
import { ParseBigIntPipe } from "../pipes/parse-bigint.pipe"

export const IdParam = (property = "id") => Param(property, ParseBigIntPipe)
