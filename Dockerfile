FROM node:8

RUN npm install

ENV NODE_ENV production

RUN npm run build

EXPOSE 8080
