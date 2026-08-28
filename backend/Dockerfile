# Tek asamali build - prisma/ klasoru npm ci'dan once kopyalanip generate
# ayri bir adim olarak bu container'in kendi isletim sisteminde calistirilir
# (Azure Container Apps'e farkli bir ortamda uretilmis bir engine tasimiyoruz,
# uyumsuzluk riski olmuyor). Bu surumde @prisma/client'ta postinstall kancasi
# olmadigi node_modules'tan dogrulandi, bu yuzden generate acikca cagriliyor.
FROM node:24-slim

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci
RUN npx prisma generate

COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["node", "dist/index.js"]
