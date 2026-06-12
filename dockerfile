FROM oven/bun:1.3-alpine AS base
WORKDIR /app

RUN apk add --no-cache openssl

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

RUN bunx prisma generate
RUN bun run build

FROM oven/bun:1.3-alpine AS prod
WORKDIR /app

RUN apk add --no-cache openssl

COPY --from=base /app/dist ./dist
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/prisma ./prisma
COPY --from=base /app/package.json ./package.json

EXPOSE 4000

CMD ["sh", "-c", "bunx prisma migrate deploy && bun start"]
