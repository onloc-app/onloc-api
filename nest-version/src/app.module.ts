import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { TerminusModule } from "@nestjs/terminus"
import { AppController } from "./app.controller.js"
import { AppService } from "./app.service.js"
import { PrismaService } from "./prisma/prisma.service.js"
import { AuthModule } from "./auth/auth.module.js"
import { UserModule } from "./user/user.module.js"
import { AuthenticationModule } from "@nestjs/authentication"
import { AvatarModule } from "./avatar/avatar.module.js"
import { TierModule } from "./tier/tier.module.js"
import { UserTierModule } from "./user-tier/user-tier.module.js"
import { SettingModule } from "./setting/setting.module.js"
import { PreferenceModule } from "./preference/preference.module.js"
import { TokenModule } from "./token/token.module.js"

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
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
