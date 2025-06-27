#!/bin/bash

# =================================================
# Fix Database Connection Script
# =================================================

echo "🔧 Fixing Database Connection..."

echo "📋 Current .env configuration:"
cat .env | grep -E "(DB_HOST|DATABASE_URL)"

echo ""
echo "🔍 Please check your AWS RDS Console and provide the correct endpoint."
echo "   Go to: AWS Console → RDS → Databases → mingling"
echo "   Copy the 'Endpoint' value from the Connectivity & security tab"
echo ""

read -p "📝 Enter the correct RDS endpoint (press Enter to skip): " NEW_ENDPOINT

if [ ! -z "$NEW_ENDPOINT" ]; then
    echo "🔄 Updating .env with new endpoint..."
    
    # Backup current .env
    cp .env .env.backup
    
    # Update DB_HOST
    sed -i.bak "s/DB_HOST=.*/DB_HOST=$NEW_ENDPOINT/" .env
    
    # Update DATABASE_URL
    sed -i.bak "s|DATABASE_URL=mysql://root:Mingle123!@[^/]*/mingling|DATABASE_URL=mysql://root:Mingle123!@$NEW_ENDPOINT:3306/mingling|" .env
    
    echo "✅ Updated .env configuration:"
    cat .env | grep -E "(DB_HOST|DATABASE_URL)"
    
    echo ""
    echo "🔄 Restarting backend with new configuration..."
    pm2 restart mingling-backend
    
    echo ""
    echo "⏳ Waiting 5 seconds for restart..."
    sleep 5
    
    echo "🏥 Testing health check..."
    curl -s http://localhost:3001/api/health | python3 -m json.tool 2>/dev/null || curl http://localhost:3001/api/health
    
    echo ""
    echo "📋 PM2 Status:"
    pm2 status
    
else
    echo "⏩ Skipped endpoint update"
fi

echo ""
echo "🔧 Troubleshooting steps:"
echo "1. Verify RDS cluster exists in ap-southeast-2 region"
echo "2. Check security groups allow port 3306"
echo "3. Ensure RDS has public access enabled"
echo "4. Test DNS resolution: nslookup YOUR-ENDPOINT"
echo "5. Test direct connection: mysql -h YOUR-ENDPOINT -u root -p" 