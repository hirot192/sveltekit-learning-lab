FROM node:24.21.0-bookworm-slim@sha256:2fe369e969550cde8e867afc3fe370b260140cab4a23d467074295b42163d553 AS dependencies

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS build

# SvelteKit imports server modules while analysing the build. No connection is made,
# but the runtime-only DB module still validates that the variable exists.
ENV DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build

COPY . .
RUN npm run build

FROM node:24.21.0-bookworm-slim@sha256:2fe369e969550cde8e867afc3fe370b260140cab4a23d467074295b42163d553 AS production-dependencies

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

FROM node:24.21.0-bookworm-slim@sha256:2fe369e969550cde8e867afc3fe370b260140cab4a23d467074295b42163d553 AS runner

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000

WORKDIR /app

COPY --from=production-dependencies --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/build ./build
COPY --chown=node:node package.json package-lock.json ./
COPY --chown=node:node drizzle ./drizzle
COPY --chown=node:node scripts/migrate.mjs scripts/seed.mjs ./scripts/

USER node
EXPOSE 3000

CMD ["node", "build"]
