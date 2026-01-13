#!/bin/bash

# Script para iniciar todos los servicios de Fashion AI

echo "Starting Fashion AI - All services..."
echo ""

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para matar procesos al salir
cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping all services...${NC}"
    pkill -f "node.*server.js" 2>/dev/null
    pkill -f "nodemon" 2>/dev/null
    pkill -f "vite" 2>/dev/null
    pkill -f "python.*app.py" 2>/dev/null
    echo -e "${GREEN}Services stopped${NC}"
    exit 0
}

# Capturar Ctrl+C
trap cleanup SIGINT SIGTERM

# Obtener el directorio del script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Backend
echo -e "${BLUE}Starting Backend (port 5002)...${NC}"
cd "$SCRIPT_DIR/backend"
npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}Backend started (PID: $BACKEND_PID)${NC}"

sleep 2

echo -e "${BLUE}Starting ML Service (port 5001)...${NC}"
cd "$SCRIPT_DIR/ml-service"
source venv/bin/activate
python app.py > ../logs/ml-service.log 2>&1 &
ML_PID=$!
echo -e "${GREEN}ML Service started (PID: $ML_PID)${NC}"

sleep 2

echo -e "${BLUE}Starting Frontend (port 3000)...${NC}"
cd "$SCRIPT_DIR/frontend"
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}Frontend started (PID: $FRONTEND_PID)${NC}"

# Crear directorio de logs si no existe
mkdir -p "$SCRIPT_DIR/logs"

echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}All services are running!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo -e "Backend:    http://localhost:5002"
echo -e "ML Service: http://localhost:5001"
echo -e "Frontend:   http://localhost:3000"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Esperar a que el usuario presione Ctrl+C
wait

