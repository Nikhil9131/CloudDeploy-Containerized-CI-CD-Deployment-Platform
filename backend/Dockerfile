# Multi-stage production Dockerfile for CloudDeploy Backend
FROM node:20-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --omit=dev && npx prisma generate

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install dumb-init for proper PID 1 signal forwarding
RUN apk add --no-cache dumb-init curl

# Create non-root group and user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Copy dependencies and Prisma generated client
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/prisma ./prisma
COPY package.json ./
COPY src ./src

# Set ownership
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 5000

# Healthcheck conforming to Kubernetes liveness/readiness
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]
