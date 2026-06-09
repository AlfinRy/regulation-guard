# Node.js Backend — Hono + AI SDK
FROM node:20-alpine

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

# Build TypeScript
RUN npx tsc --noEmit || true

EXPOSE 3001
CMD ["npx", "tsx", "src/index.ts"]
