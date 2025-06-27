#!/bin/bash

# Mingling Backend EC2 Deployment Script
# 이 스크립트는 AWS EC2에서 Mingling 백엔드를 배포하기 위한 자동화 스크립트입니다.

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="mingling-backend"
CONTAINER_NAME="mingling-backend"
IMAGE_NAME="mingling-backend"
PORT=3001

echo -e "${BLUE}🚀 Starting Mingling Backend Deployment on EC2${NC}"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root (not recommended)
if [ "$EUID" -eq 0 ]; then
    print_warning "Running as root. Consider using a non-root user for security."
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_error ".env file not found!"
    echo "Please create .env file with the following content:"
    echo ""
    echo "# AWS RDS Aurora MySQL Configuration"
    echo "DB_HOST=mingling.cluster-cf48qyyuqv7.ap-southeast-2.rds.amazonaws.com"
    echo "DB_PORT=3306"
    echo "DB_USER=root"
    echo "DB_PASSWORD=Mingle123!"
    echo "DB_NAME=mingling"
    echo ""
    echo "# Server Configuration"
    echo "PORT=3001"
    echo "NODE_ENV=production"
    echo ""
    echo "# CORS Configuration"
    echo "CLIENT_ORIGIN=https://your-frontend-domain.com"
    echo ""
    echo "# OpenAI Configuration"
    echo "OPENAI_API_KEY=your_openai_api_key_here"
    exit 1
fi

print_status "✅ .env file found"

# Update system packages
print_status "📦 Updating system packages..."
sudo apt-get update -y

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    print_status "🐳 Installing Docker..."
    sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io
    sudo usermod -aG docker $USER
    print_status "✅ Docker installed successfully"
else
    print_status "✅ Docker already installed"
fi

# Install Docker Compose if not present
if ! command -v docker-compose &> /dev/null; then
    print_status "📦 Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    print_status "✅ Docker Compose installed successfully"
else
    print_status "✅ Docker Compose already installed"
fi

# Start Docker service
print_status "🔄 Starting Docker service..."
sudo systemctl start docker
sudo systemctl enable docker

# Stop existing container if running
if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
    print_status "🛑 Stopping existing container..."
    docker stop $CONTAINER_NAME
fi

# Remove existing container
if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
    print_status "🗑️  Removing existing container..."
    docker rm $CONTAINER_NAME
fi

# Remove existing image to force rebuild
if [ "$(docker images -q $IMAGE_NAME)" ]; then
    print_status "🗑️  Removing existing image..."
    docker rmi $IMAGE_NAME
fi

# Build new image
print_status "🔨 Building Docker image..."
docker build -t $IMAGE_NAME .

# Run the container
print_status "🚀 Starting new container..."
docker run -d \
    --name $CONTAINER_NAME \
    --restart unless-stopped \
    -p $PORT:$PORT \
    --env-file .env \
    $IMAGE_NAME

# Wait for container to start
print_status "⏳ Waiting for container to start..."
sleep 10

# Check if container is running
if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
    print_status "✅ Container is running successfully"
    
    # Test health endpoint
    print_status "🏥 Testing health endpoint..."
    sleep 5
    
    if curl -f http://localhost:$PORT/api/health > /dev/null 2>&1; then
        print_status "✅ Health check passed"
    else
        print_warning "⚠️  Health check failed. Check logs with: docker logs $CONTAINER_NAME"
    fi
    
    # Show container status
    print_status "📊 Container status:"
    docker ps | grep $CONTAINER_NAME
    
    echo ""
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo ""
    echo "📝 Useful commands:"
    echo "  View logs:      docker logs -f $CONTAINER_NAME"
    echo "  Stop container: docker stop $CONTAINER_NAME"
    echo "  Start container: docker start $CONTAINER_NAME"
    echo "  Remove container: docker rm $CONTAINER_NAME"
    echo "  Health check:   curl http://localhost:$PORT/api/health"
    echo ""
    echo -e "${YELLOW}🔧 EC2 Security Group Configuration:${NC}"
    echo "  Inbound Rules Required:"
    echo "  - Port 3001 (HTTP) from 0.0.0.0/0 or your frontend domain"
    echo "  - Port 22 (SSH) from your IP"
    echo "  - Port 80 (HTTP) from 0.0.0.0/0 (if using Nginx)"
    echo "  - Port 443 (HTTPS) from 0.0.0.0/0 (if using SSL)"
    echo ""
    echo -e "${YELLOW}🗄️  RDS Security Group Configuration:${NC}"
    echo "  Inbound Rules Required:"
    echo "  - Port 3306 (MySQL) from EC2 Security Group ID"
    echo ""
    
else
    print_error "❌ Container failed to start"
    print_error "Check logs with: docker logs $CONTAINER_NAME"
    exit 1
fi

# EC2 배포 후 확인사항
echo -e "${BLUE}📋 Post-deployment checklist:${NC}"
echo "1. ✅ EC2 Security Group allows port $PORT"
echo "2. ✅ RDS Security Group allows port 3306 from EC2"
echo "3. ✅ .env file contains correct RDS connection details"
echo "4. ✅ Container is running: $(docker ps | grep $CONTAINER_NAME > /dev/null && echo "Yes" || echo "No")"
echo "5. ⏳ Health endpoint responds: Test with curl http://$(curl -s http://checkip.amazonaws.com):$PORT/api/health"
echo "6. ⏳ Database connection: Check logs for DB connection success"

echo ""
echo -e "${GREEN}🌐 Your API is now available at:${NC}"
echo "  http://$(curl -s http://checkip.amazonaws.com):$PORT"
echo "  Health: http://$(curl -s http://checkip.amazonaws.com):$PORT/api/health" 