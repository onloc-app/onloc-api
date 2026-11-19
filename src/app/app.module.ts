import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { TerminusModule } from "@nestjs/terminus"
import { AppController } from "./app.controller.js"
import { AppService } from "./app.service.js"
import { PrismaService } from "../prisma/prisma.service.js"
import { AuthModule } from "../auth/auth.module.js"
import { UserModule } from "../user/user.module.js"
import { AuthenticationModule } from "@nestjs/authentication"
import { AvatarModule } from "../avatar/avatar.module.js"
import { TierModule } from "../tier/tier.module.js"
import { UserTierModule } from "../user-tier/user-tier.module.js"
import { SettingModule } from "../setting/setting.module.js"
import { PreferenceModule } from "../preference/preference.module.js"
import { TokenModule } from "../token/token.module.js"
import { ApiKeyModule } from "../api-key/api-key.module.js"
import { DeviceModule } from "../device/device.module.js"
import { ConnectionModule } from "../connection/connection.module.js"
import { UnifiedPushModule } from "../unified-push/unified-push.module.js"
import { DeviceShareService } from "../device-share/device-share.service.js"
import { DeviceShareController } from "../device-share/device-share.controller.js"
import { DeviceShareModule } from "../device-share/device-share.module.js"
import { LocationModule } from "../location/location.module.js"

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthenticationModule.forRoot({
      accessToken: {
        key:
          process.env.ACCESS_TOKEN_SECRET || "onloc-access-token-secret-string",
      },
    }),
    TerminusModule,
    AuthModule,
    UserModule,
    AvatarModule,
    TierModule,
    UserTierModule,
    SettingModule,
    PreferenceModule,
    TokenModule,
    ApiKeyModule,
    DeviceModule,
    ConnectionModule,
    UnifiedPushModule,
    DeviceShareModule,
    LocationModule,
  ],
  controllers: [AppController, DeviceShareController],
  providers: [AppService, PrismaService, DeviceShareService],
})
export class AppModule {}
