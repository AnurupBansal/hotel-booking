FROM node:20.19.0

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && node index.js"]