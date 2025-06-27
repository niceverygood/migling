# Multi-stage build for production optimization
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy built application and node_modules
COPY --from=builder --chown=nextjs:nodejs /app/build ./build
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3001

# Set environment
ENV NODE_ENV=production
ENV PORT=3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').request('http://localhost:3001/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).end()"

# Start application with dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "build/index.js"]

# Docker build command:
# docker build -t mingling-backend .
#
# Docker run command:
# docker run -d --name mingling-backend -p 3001:3001 --env-file .env mingling-backend
#
# EC2 배포 시 유의사항:
# 1. EC2 Security Group에서 3001 포트 허용
# 2. RDS Security Group에서 EC2 접근 허용 (3306 포트)
# 3. .env 파일은 컨테이너 실행 시 --env-file 옵션으로 전달
# 4. 로그 확인: docker logs mingling-backend
# 5. 컨테이너 내부 접근: docker exec -it mingling-backend sh 