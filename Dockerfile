FROM node:16.15-alpine

WORKDIR /usr/src/app

RUN npm install -g @nestjs/cli && \
    npm i -g typescript

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run test:cov

ARG PORT=3000
ENV PORT=$PORT
EXPOSE $PORT

RUN npm run build

CMD ["node", "dist/main.js"]
