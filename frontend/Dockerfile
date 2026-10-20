# ==========================================
# Frontend: Next.js 16 Multi-stage Dockerfile
# ==========================================

# 1. Base Image
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# 2. Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 3. Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 빌드 타임 환경변수
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
# 클라이언트가 브라우저에서 접근하는 백엔드 URL (기본값: 동일 출처 /api 프록시)
ARG NEXT_PUBLIC_API_URL=/api
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN npm run build

# 4. Runner (Production)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 보안: Non-root 시스템 유저 생성
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Standalone 빌드 결과물 및 정적 파일 복사
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
