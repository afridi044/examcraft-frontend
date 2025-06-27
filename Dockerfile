# =============================================================================
# ExamCraft Frontend - Production Dockerfile (Based on Working Dev Version)
# =============================================================================
# This Dockerfile is based on the working development version with minimal changes:
# - Same structure and dependencies as the working dev version
# - Only changes: NODE_ENV=production and runs built app instead of dev server
# =============================================================================

# Use the same base image as the working development version
FROM node:20.11.1-alpine

# Install the same dependencies as development (which worked)
RUN apk update && apk upgrade && \
    apk add --no-cache \
        libc6-compat \
        dumb-init \
        git \
        openssh \
        curl \
    && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Create non-root user (same as development)
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy package files first for better layer caching (same as dev)
COPY package.json package-lock.json* ./

# Install all dependencies (same as development approach that worked)
RUN npm ci --frozen-lockfile && \
    npm cache clean --force

# Copy source code with proper permissions (same as dev)
COPY --chown=nextjs:nodejs . .

# Build the Next.js application (this is the main difference from dev)
RUN npm run build

# Create necessary directories with proper permissions (same as dev)
RUN mkdir -p .next && \
    chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set production environment variables
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME="0.0.0.0"

# Health check (use curl like development version since it worked)
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Use dumb-init for proper signal handling (same as dev)
ENTRYPOINT ["dumb-init", "--"]

# Start the production application (only difference from dev CMD)
CMD ["npm", "run", "start"] 