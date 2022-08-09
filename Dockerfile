FROM node:16.15-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

ARG PORT=3000
ENV PORT=$PORT
EXPOSE $PORT

RUN npm run build

CMD ["node", "dist/main.js"]
