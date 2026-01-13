#!/bin/bash

# Script para detener todos los servicios de Fashion AI

echo "Stopping all Fashion AI services..."

# Matar procesos
pkill -f "node.*server.js" 2>/dev/null
pkill -f "nodemon" 2>/dev/null
pkill -f "vite" 2>/dev/null
pkill -f "python.*app.py" 2>/dev/null

# Liberar puertos
lsof -ti:3000,5001,5002 | xargs kill -9 2>/dev/null

sleep 1

# Verificar
if lsof -ti:3000,5001,5002 > /dev/null 2>&1; then
    echo "Warning: Some ports are still in use"
else
    echo "All services have been stopped"
fi

