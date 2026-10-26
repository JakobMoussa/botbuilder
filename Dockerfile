FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package*.json .npmrc ./
RUN npm ci
COPY . .
RUN npm run build && mkdir -p /app/runtime && chown -R node:node /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
USER node
EXPOSE 3000
CMD ["node", "scripts/boot.mjs", "web"]
