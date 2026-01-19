FROM node:20

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl

COPY package.json package-lock.json ./
RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
