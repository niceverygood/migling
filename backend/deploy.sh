#!/bin/bash

# Mingling Backend Auto-Deploy Script
# GitHub Actions에서 호출되는 자동 배포 스크립트

set -e

PROJECT_DIR="/home/ubuntu/mingling"
BRANCH=${1:-main}
ENVIRONMENT=${2:-production}

echo "🚀 Starting auto-deploy"
echo "📂 Branch: $BRANCH"
echo "🌍 Environment: $ENVIRONMENT"
echo "📁 Project Dir: $PROJECT_DIR"

# Function for logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Function for error handling
handle_error() {
    log "❌ Deployment failed at step: $1"
    log "🔄 Rolling back to previous version..."
    if pm2 describe mingling-backend > /dev/null 2>&1; then
        pm2 restart mingling-backend
    fi
    exit 1
}

# 1. 프로젝트 디렉토리로 이동
log "📍 Navigating to project directory..."
cd $PROJECT_DIR || handle_error "Directory navigation"

# 2. 최신 코드 가져오기
log "📥 Pulling latest code..."
git fetch origin || handle_error "Git fetch"
git checkout $BRANCH || handle_error "Git checkout"
git pull origin $BRANCH || handle_error "Git pull"

# 3. 백엔드 디렉토리로 이동
cd backend || handle_error "Backend directory navigation"

# 4. 기존 서비스 중지
log "⏹️  Stopping current service..."
pm2 stop mingling-backend || log "⚠️  Service not running"

# 5. 의존성 설치
log "📦 Installing dependencies..."
npm ci --production=false || handle_error "NPM install"

# 6. TypeScript 빌드
log "🔨 Building TypeScript..."
npm run build || handle_error "Build process"

# 7. 데이터베이스 마이그레이션 실행
log "🗄️  Running database migrations..."
NODE_ENV=$ENVIRONMENT npm run migrate || handle_error "Database migration"

# 8. PM2로 서비스 시작/재시작
log "🔄 Starting service with PM2..."
if pm2 describe mingling-backend > /dev/null 2>&1; then
    pm2 restart mingling-backend || handle_error "PM2 restart"
else
    pm2 start build/index.js --name mingling-backend || handle_error "PM2 start"
fi

# 9. PM2 설정 저장
log "💾 Saving PM2 configuration..."
pm2 save || log "⚠️  PM2 save failed"

# 10. Health check
log "🏥 Performing health check..."
sleep 5
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    log "✅ Health check passed!"
else
    handle_error "Health check"
fi

# 11. 상태 확인
log "📊 Final status check..."
pm2 status

log "🎉 Auto-deploy completed successfully!"
log "🌐 Service is running at: http://localhost:3001" 