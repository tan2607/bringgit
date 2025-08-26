# syntax=docker/dockerfile:1.4
FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM deps AS build-stage
COPY . .
ARG NUXT_UI_PRO_LICENSE
ENV NUXT_UI_PRO_LICENSE=$NUXT_UI_PRO_LICENSE
RUN bun run build

FROM oven/bun:1 AS production-deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

FROM oven/bun:1 AS production-stage
ENV NODE_ENV="production"
ENV TZ="Asia/Singapore"
WORKDIR /app
COPY --from=production-deps /app/node_modules ./node_modules
COPY --from=build-stage /app/dist ./

USER bun
EXPOSE 3000
CMD ["bun", "run", "_worker.js"]
