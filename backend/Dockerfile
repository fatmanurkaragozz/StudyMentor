# Iki asamali build - builder'da devDependencies + build araclari kalir, final
# image'a yalnizca derlenmis dist/ ve production node_modules kopyalanir. Ikisi
# de ayni node:24-slim tabanini kullandigi icin builder'da uretilen Prisma query
# engine binary'si final stage'de sorunsuz calisir (farkli bir OS'ye tasima yok).
# Amac: final image kucuk kalsin - Azure Container Apps sifira olceklendiginde
# yeni bir replica'nin bu image'i cekip acilmasi daha az surer.
FROM node:24-slim AS builder

# Prisma'nin query engine'i libssl'e ihtiyac duyuyor - node:24-slim (Debian slim)
# bunu varsayilan olarak icermiyor, "libssl.so.1.1: cannot open shared object file"
# hatasiyla runtime'da cokmeye yol aciyordu (build sirasinda sadece uyari olarak
# gorunuyordu, gercek hata container calisirken ortaya cikiyordu).
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci
RUN npx prisma generate

COPY . .
RUN npm run build

# devDependencies'i (tsx, typescript, vitest, prisma CLI...) node_modules'tan at -
# @prisma/client'in urettigi engine devDependency olmadigi icin kalir.
RUN npm prune --omit=dev

FROM node:24-slim

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["node", "dist/index.js"]
