FROM node:lts-alpine

ENV NODE_ENV=production

ARG SLACK_BOT_TOKEN

ENV SLACK_BOT_TOKEN=${SLACK_BOT_TOKEN}

ARG SLACK_APP_TOKEN

ENV SLACK_APP_TOKEN=${SLACK_APP_TOKEN}

ARG SLACK_SIGNING_SECRET

ENV SLACK_SIGNING_SECRET=${SLACK_SIGNING_SECRET}

WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]

RUN npm install --production --silent && mv node_modules ../

COPY . .

EXPOSE 3000

RUN chown -R node /usr/src/app

USER node

CMD ["node","index.js", "--SLACK_BOT_TOKEN $SLACK_BOT_TOKEN", "--SLACK_APP_TOKEN $SLACK_APP_TOKEN", "--SLACK_SIGNING_SECRET $SLACK_SIGNING_SECRET"]