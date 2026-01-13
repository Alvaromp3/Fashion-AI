#!/bin/bash

# Script para subir el proyecto a GitHub

echo "🚀 Subiendo Fashion AI a GitHub..."
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar si hay un remote configurado
if git remote -v | grep -q "origin"; then
    echo -e "${GREEN}✓ Remote 'origin' ya está configurado${NC}"
    git remote -v
else
    echo -e "${YELLOW}⚠ No hay remote configurado${NC}"
    echo ""
    echo "Para configurar el remote, ejecuta:"
    echo "  git remote add origin <URL_DE_TU_REPOSITORIO>"
    echo ""
    echo "Ejemplos:"
    echo "  git remote add origin https://github.com/tu-usuario/fashion_program.git"
    echo "  git remote add origin git@github.com:tu-usuario/fashion_program.git"
    echo ""
    read -p "¿Quieres configurar el remote ahora? (s/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        read -p "Ingresa la URL de tu repositorio de GitHub: " repo_url
        if [ ! -z "$repo_url" ]; then
            git remote add origin "$repo_url"
            echo -e "${GREEN}✓ Remote configurado${NC}"
        else
            echo -e "${RED}✗ URL vacía, cancelando...${NC}"
            exit 1
        fi
    else
        echo "Configura el remote manualmente y vuelve a ejecutar este script"
        exit 1
    fi
fi

echo ""
echo -e "${BLUE}Verificando estado del repositorio...${NC}"
git status

echo ""
echo -e "${BLUE}Haciendo push a GitHub...${NC}"

# Intentar push a master
if git push -u origin master 2>&1; then
    echo ""
    echo -e "${GREEN}════════════════════════════════════════${NC}"
    echo -e "${GREEN}✓ ¡Código subido exitosamente a GitHub!${NC}"
    echo -e "${GREEN}════════════════════════════════════════${NC}"
else
    # Si falla, intentar con main
    echo ""
    echo -e "${YELLOW}Intentando con branch 'main'...${NC}"
    git checkout -b main 2>/dev/null || git checkout main 2>/dev/null
    if git push -u origin main 2>&1; then
        echo ""
        echo -e "${GREEN}════════════════════════════════════════${NC}"
        echo -e "${GREEN}✓ ¡Código subido exitosamente a GitHub!${NC}"
        echo -e "${GREEN}════════════════════════════════════════${NC}"
    else
        echo ""
        echo -e "${RED}✗ Error al hacer push${NC}"
        echo ""
        echo "Posibles soluciones:"
        echo "1. Verifica que el repositorio existe en GitHub"
        echo "2. Verifica tus credenciales de GitHub"
        echo "3. Si el repositorio está vacío, puedes hacer:"
        echo "   git push -u origin master --force"
        exit 1
    fi
fi

echo ""
echo -e "${GREEN}¡Listo! Tu código está en GitHub 🎉${NC}"
