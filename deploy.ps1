# Script de Deployment - July Finance App (PowerShell)
# Uso: .\deploy.ps1 [render|railway|heroku|docker]

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("render", "railway", "heroku", "docker", "vercel")]
    [string]$Platform
)

# Configurar para parar em caso de erro
$ErrorActionPreference = "Stop"

Write-Host "🚀 Iniciando deployment da aplicação July Finance..." -ForegroundColor Green

# Função para log
function Write-Log {
    param([string]$Message, [string]$Color = "Green")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $Message" -ForegroundColor $Color
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERRO] $Message" -ForegroundColor Red
    exit 1
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[AVISO] $Message" -ForegroundColor Yellow
}

# Verificar se o Git está configurado
function Test-GitRepository {
    if (-not (Test-Path ".git")) {
        Write-Error "Este diretório não é um repositório Git. Execute 'git init' primeiro."
    }
}

# Verificar se há mudanças não commitadas
function Test-UncommittedChanges {
    $status = git status --porcelain
    if ($status) {
        Write-Warning "Há mudanças não commitadas. Deseja continuar mesmo assim? (y/N)"
        $response = Read-Host
        if ($response -notmatch "^[Yy]$") {
            Write-Error "Deployment cancelado. Faça commit das mudanças primeiro."
        }
    }
}

# Build da aplicação
function Build-Application {
    Write-Log "Construindo aplicação..."
    
    # Build do frontend
    Write-Log "Build do frontend..."
    Set-Location "july"
    npm ci
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Falha no npm ci do frontend"
    }
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Falha no build do frontend"
    }
    Set-Location ".."
    
    # Verificar dependências do backend
    Write-Log "Verificando dependências do backend..."
    Set-Location "backend"
    npm ci --only=production
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Falha no npm ci do backend"
    }
    Set-Location ".."
    
    Write-Log "✅ Build concluído com sucesso!"
}

# Deployment no Render
function Deploy-Render {
    Write-Log "Deployando no Render..."
    
    # Verificar se o CLI do Render está instalado
    try {
        $null = Get-Command render -ErrorAction Stop
    } catch {
        Write-Error "CLI do Render não encontrado. Instale com: npm install -g @render/cli"
    }
    
    # Verificar se o arquivo render.yaml existe
    if (-not (Test-Path "render.yaml")) {
        Write-Error "Arquivo render.yaml não encontrado!"
    }
    
    # Deploy usando Blueprint
    render blueprint apply render.yaml
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Falha no deploy no Render"
    }
    
    Write-Log "✅ Deploy no Render concluído!"
}

# Deployment no Railway
function Deploy-Railway {
    Write-Log "Deployando no Railway..."
    
    # Verificar se o CLI do Railway está instalado
    try {
        $null = Get-Command railway -ErrorAction Stop
    } catch {
        Write-Error "CLI do Railway não encontrado. Instale com: npm install -g @railway/cli"
    }
    
    # Login no Railway
    railway login
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Falha no login no Railway"
    }
    
    # Deploy
    railway up
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Falha no deploy no Railway"
    }
    
    Write-Log "✅ Deploy no Railway concluído!"
}

# Deployment no Heroku
function Deploy-Heroku {
    Write-Log "Deployando no Heroku..."
    
    # Verificar se o CLI do Heroku está instalado
    try {
        $null = Get-Command heroku -ErrorAction Stop
    } catch {
        Write-Error "CLI do Heroku não encontrado. Instale com: npm install -g heroku"
    }
    
    # Verificar se o app já existe
    try {
        heroku apps:info | Out-Null
    } catch {
        Write-Log "Criando novo app no Heroku..."
        heroku create july-finance-app
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Falha na criação do app no Heroku"
        }
    }
    
    # Configurar variáveis de ambiente
    Write-Log "Configurando variáveis de ambiente..."
    heroku config:set NODE_ENV=production
    heroku config:set JWT_SECRET=([System.Web.Security.Membership]::GeneratePassword(32, 10))
    
    # Deploy
    git push heroku main
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Falha no deploy no Heroku"
    }
    
    Write-Log "✅ Deploy no Heroku concluído!"
}

# Deployment com Docker
function Deploy-Docker {
    Write-Log "Deployando com Docker..."
    
    # Verificar se o Docker está instalado
    try {
        $null = Get-Command docker -ErrorAction Stop
    } catch {
        Write-Error "Docker não encontrado. Instale o Docker primeiro."
    }
    
    # Verificar se o Docker Compose está instalado
    try {
        $null = Get-Command docker-compose -ErrorAction Stop
    } catch {
        Write-Error "Docker Compose não encontrado. Instale o Docker Compose primeiro."
    }
    
    # Build e start dos containers
    docker-compose up -d --build
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Falha no deploy com Docker"
    }
    
    Write-Log "✅ Deploy com Docker concluído!"
    Write-Log "Aplicação disponível em: http://localhost"
}

# Deployment na Vercel
function Deploy-Vercel {
    Write-Log "Deployando na Vercel..."
    
    # Verificar se o CLI da Vercel está instalado
    try {
        $null = Get-Command vercel -ErrorAction Stop
    } catch {
        Write-Error "CLI da Vercel não encontrado. Instale com: npm install -g vercel"
    }
    
    # Verificar se está logado na Vercel
    try {
        vercel whoami | Out-Null
    } catch {
        Write-Log "Fazendo login na Vercel..."
        vercel login
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Falha no login na Vercel"
        }
    }
    
    # Deploy do frontend
    Write-Log "Deployando frontend na Vercel..."
    Set-Location "july"
    vercel --prod
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Falha no deploy na Vercel"
    }
    Set-Location ".."
    
    Write-Log "✅ Deploy na Vercel concluído!"
    Write-Log "Frontend disponível em: https://seu-app.vercel.app"
    Write-Log "⚠️  Lembre-se de configurar o backend separadamente!"
}

# Verificar saúde da aplicação
function Test-HealthCheck {
    Write-Log "Verificando saúde da aplicação..."
    
    # Aguardar um pouco para a aplicação inicializar
    Start-Sleep -Seconds 10
    
    # Tentar acessar o health check
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Log "✅ Aplicação está funcionando corretamente!"
        } else {
            Write-Warning "⚠️  Health check falhou. Verifique os logs."
        }
    } catch {
        Write-Warning "⚠️  Health check falhou. Verifique os logs."
    }
}

# Função principal
function Main {
    param([string]$Platform)
    
    # Verificações iniciais
    Test-GitRepository
    Test-UncommittedChanges
    
    # Build da aplicação
    Build-Application
    
    # Deploy baseado na plataforma
    switch ($Platform) {
        "render" {
            Deploy-Render
        }
        "railway" {
            Deploy-Railway
        }
        "heroku" {
            Deploy-Heroku
        }
        "docker" {
            Deploy-Docker
            Test-HealthCheck
        }
        "vercel" {
            Deploy-Vercel
        }
        default {
            Write-Error "Plataforma não reconhecida. Use: render, railway, heroku, docker ou vercel"
        }
    }
    
    Write-Log "🎉 Deployment concluído com sucesso!"
}

# Executar função principal
Main -Platform $Platform 