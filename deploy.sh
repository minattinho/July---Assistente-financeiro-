#!/bin/bash

# Script de Deployment - July Finance App
# Uso: ./deploy.sh [render|railway|heroku|docker]

set -e

echo "🚀 Iniciando deployment da aplicação July Finance..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERRO] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[AVISO] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Verificar se o Git está configurado
check_git() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        error "Este diretório não é um repositório Git. Execute 'git init' primeiro."
    fi
}

# Verificar se há mudanças não commitadas
check_changes() {
    if ! git diff-index --quiet HEAD --; then
        warning "Há mudanças não commitadas. Deseja continuar mesmo assim? (y/N)"
        read -r response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            error "Deployment cancelado. Faça commit das mudanças primeiro."
        fi
    fi
}

# Build da aplicação
build_app() {
    log "Construindo aplicação..."
    
    # Build do frontend
    log "Build do frontend..."
    cd july
    npm ci
    npm run build
    cd ..
    
    # Verificar dependências do backend
    log "Verificando dependências do backend..."
    cd backend
    npm ci --only=production
    cd ..
    
    log "✅ Build concluído com sucesso!"
}

# Deployment no Render
deploy_render() {
    log "Deployando no Render..."
    
    if ! command -v render &> /dev/null; then
        error "CLI do Render não encontrado. Instale com: npm install -g @render/cli"
    fi
    
    # Verificar se o arquivo render.yaml existe
    if [ ! -f "render.yaml" ]; then
        error "Arquivo render.yaml não encontrado!"
    fi
    
    # Deploy usando Blueprint
    render blueprint apply render.yaml
    
    log "✅ Deploy no Render concluído!"
}

# Deployment no Railway
deploy_railway() {
    log "Deployando no Railway..."
    
    if ! command -v railway &> /dev/null; then
        error "CLI do Railway não encontrado. Instale com: npm install -g @railway/cli"
    fi
    
    # Login no Railway
    railway login
    
    # Deploy
    railway up
    
    log "✅ Deploy no Railway concluído!"
}

# Deployment no Heroku
deploy_heroku() {
    log "Deployando no Heroku..."
    
    if ! command -v heroku &> /dev/null; then
        error "CLI do Heroku não encontrado. Instale com: npm install -g heroku"
    fi
    
    # Verificar se o app já existe
    if ! heroku apps:info &> /dev/null; then
        log "Criando novo app no Heroku..."
        heroku create july-finance-app
    fi
    
    # Configurar variáveis de ambiente
    log "Configurando variáveis de ambiente..."
    heroku config:set NODE_ENV=production
    heroku config:set JWT_SECRET=$(openssl rand -base64 32)
    
    # Deploy
    git push heroku main
    
    log "✅ Deploy no Heroku concluído!"
}

# Deployment com Docker
deploy_docker() {
    log "Deployando com Docker..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker não encontrado. Instale o Docker primeiro."
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose não encontrado. Instale o Docker Compose primeiro."
    fi
    
    # Build e start dos containers
    docker-compose up -d --build
    
    log "✅ Deploy com Docker concluído!"
    log "Aplicação disponível em: http://localhost"
}

# Verificar saúde da aplicação
health_check() {
    log "Verificando saúde da aplicação..."
    
    # Aguardar um pouco para a aplicação inicializar
    sleep 10
    
    # Tentar acessar o health check
    if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
        log "✅ Aplicação está funcionando corretamente!"
    else
        warning "⚠️  Health check falhou. Verifique os logs."
    fi
}

# Função principal
main() {
    local platform=$1
    
    # Verificações iniciais
    check_git
    check_changes
    
    # Build da aplicação
    build_app
    
    # Deploy baseado na plataforma
    case $platform in
        "render")
            deploy_render
            ;;
        "railway")
            deploy_railway
            ;;
        "heroku")
            deploy_heroku
            ;;
        "docker")
            deploy_docker
            health_check
            ;;
        *)
            error "Plataforma não reconhecida. Use: render, railway, heroku ou docker"
            ;;
    esac
    
    log "🎉 Deployment concluído com sucesso!"
}

# Executar função principal
main "$@" 