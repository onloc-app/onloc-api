FROM oven/bun:1.3 AS base

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

RUN bunx prisma generate

EXPOSE 4000

CMD ["sh", "-c", "bunx prisma migrate deploy && bun start"]
