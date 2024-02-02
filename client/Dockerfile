FROM node:20-alpine3.18

WORKDIR /app/waddlefy

ENV NPM_CONFIG_PREFIX /home/node/.npm-global
ENV PATH $PATH:/home/node/.npm-global/bin

RUN apk upgrade --no-cache && \
    apk add --update --no-cache vim git make curl bash && \
    yarn global add @vue/cli vite

