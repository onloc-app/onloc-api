import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from "@nestjs/common"
import { CurrentUser } from "@nestjs/authentication"
import type { User } from "@prisma/client"
import type { Response } from "express"
import { ConnectionDto } from "./dtos/connection.dto.js"
import { GetConnectionsResponseDto } from "./dtos/responses/get-connections-response.dto.js"
import { PostSendConnectionResponseDto } from "./dtos/responses/post-send-connection-response.dto.js"
import { PostSendConnectionRequestDto } from "./dtos/requests/post-send-connection-request.dto.js"
import { ConnectionService } from "./connection.service.js"
import { PostAcceptConnectionRequestDto } from "./dtos/requests/post-accept-connection-request.dto.js"
import { PostRejectConnectionRequestDto } from "./dtos/requests/post-reject-connection-request.dto.js"
import { PostAcceptConnectionResponseDto } from "./dtos/responses/post-accept-connection-response.dto.js"
import { PostRejectConnectionResponseDto } from "./dtos/responses/post-reject-connection-response.dto.js"
import { ConnectionWithUsersDto } from "./dtos/connection-with-users.dto.js"

@Controller("connections")
export class ConnectionController {
  constructor(private readonly connectionService: ConnectionService) {}

  @Post("send")
  async sendRequest(
    @CurrentUser() user: User,
    @Body() body: PostSendConnectionRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PostSendConnectionResponseDto> {
    const result = await this.connectionService.sendRequest(
      user.id,
      BigInt(body.addressee_id),
    )
    res.status(result.created ? HttpStatus.CREATED : HttpStatus.OK)
    return { connection: ConnectionDto.from(result.connection) }
  }

  @Post("accept")
  @HttpCode(HttpStatus.OK)
  async accept(
    @CurrentUser() user: User,
    @Body() body: PostAcceptConnectionRequestDto,
  ): Promise<PostAcceptConnectionResponseDto> {
    const connection = await this.connectionService.accept(
      BigInt(body.id),
      user.id,
    )
    return { connection: ConnectionDto.from(connection) }
  }

  @Post("reject")
  @HttpCode(HttpStatus.OK)
  async reject(
    @CurrentUser() user: User,
    @Body() body: PostRejectConnectionRequestDto,
  ): Promise<PostRejectConnectionResponseDto> {
    const connection = await this.connectionService.reject(
      BigInt(body.id),
      user.id,
    )
    return { connection: ConnectionDto.from(connection) }
  }

  @Get()
  async findAll(@CurrentUser() user: User): Promise<GetConnectionsResponseDto> {
    const connections = await this.connectionService.findAll(user.id)
    return {
      connections: connections.map((connection) =>
        ConnectionWithUsersDto.from(connection),
      ),
    }
  }
}
