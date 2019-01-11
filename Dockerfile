FROM node:8

RUN npm install \
  && npm cache clean --force

ENV NODE_ENV production

RUN npm run build

EXPOSE 8080

CMD [ "node", "." ]
