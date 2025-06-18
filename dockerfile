FROM oven/bun:latest AS base

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install

COPY . .

RUN bun run build

EXPOSE 4000

CMD ["bun", "start"]