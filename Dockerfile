FROM node:lts-alpine3.16 as builder

COPY package.json pnpm-lock.yaml ./

RUN npm i -g pnpm && pnpm i --frozen-lockfile --prod --ignore-scripts

FROM gcr.io/distroless/nodejs:16

COPY package.json ./
COPY server.js ./
COPY dist ./dist
COPY --from=builder node_modules node_modules

CMD ["server.js"]