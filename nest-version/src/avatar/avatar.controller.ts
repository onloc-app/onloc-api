import {
  Controller,
  Delete,
  FileTypeValidator,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common"
import { FileInterceptor } from "@nestjs/platform-express"
import type { User } from "@prisma/client"
import type {} from "multer"
import { AvatarService } from "./avatar.service.js"
import { CurrentUser } from "@nestjs/authentication"
import { AvatarDto } from "./dtos/avatar.dto.js"

const MAX_FILE_SIZE = 5 * 1024 * 1024

@Controller("avatars")
export class AvatarController {
  constructor(private readonly avatarService: AvatarService) {}

  @UseInterceptors(
    FileInterceptor("avatar", { limits: { fileSize: MAX_FILE_SIZE } }),
  )
  @Post()
  async upsert(
    @CurrentUser() user: User,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE }),
          new FileTypeValidator({
            fileType: /^image\/(png|jpeg|webp)$/,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<AvatarDto> {
    const avatar = await this.avatarService.store(user, file)
    return {
      id: avatar.id.toString(),
      user_id: avatar.user_id.toString(),
      url: avatar.url,
      created_at: avatar.created_at,
      updated_at: avatar.updated_at,
    }
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentUser() user: User): Promise<void> {
    return await this.avatarService.remove(user)
  }
}
