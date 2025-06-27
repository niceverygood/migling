#!/bin/bash
cd ~/mingling
git pull
docker compose -f infra/docker-compose.backend.yml up --build -d
echo "✅  API redeployed. Allowed origin -> $CLIENT_ORIGIN" 