# syntax=docker/dockerfile:1
FROM node:lts-alpine AS builder
WORKDIR /usr/app
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build && npm run pack && npm run copy-other-required-files

FROM node:lts-alpine
WORKDIR /usr/app
COPY --from=builder /usr/app/dist ./

ENV NODE_ENV="production" \
    PORT="3002"

EXPOSE $PORT
CMD ["node", "index.js"]
