# server/Dockerfile
# Multi-stage build: keeps the final image lean by discarding devDependencies.

# ── Stage 1: Install all deps (including dev) ─────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# ── Stage 2: Production image ─────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# Copy only production dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Remove devDependencies from node_modules in the runner stage
RUN npm prune --production

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "server.js"]
