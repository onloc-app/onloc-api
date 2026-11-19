import { NestFactory } from "@nestjs/core"
import { NestExpressApplication } from "@nestjs/platform-express"
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger"
import { AppModule } from "./app/app.module.js"
import { ValidationPipe } from "@nestjs/common"
import { resolve } from "node:path"
import { getApiVersion } from "./common/helpers/version.js"

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  app.enableCors({ origin: "*" })
  app.useStaticAssets(resolve(process.cwd(), "uploads"), {
    prefix: "/uploads",
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  )

  const config = new DocumentBuilder()
    .setTitle("Onloc API")
    .setDescription("The Onloc API's endpoints documentation")
    .setVersion(getApiVersion())
    .build()
  const documentFactory = () => SwaggerModule.createDocument(app, config)
  SwaggerModule.setup("docs", app, documentFactory)

  app.setGlobalPrefix("api")
  await app.listen(process.env.PORT ?? 3000)
}
await bootstrap()
