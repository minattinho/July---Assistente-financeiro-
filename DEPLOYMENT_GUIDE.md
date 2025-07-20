# 🚀 Guia de Deployment - Aplicação Financeira July

## 📋 Visão Geral

Este guia irá ajudá-lo a colocar sua aplicação financeira em produção. A aplicação consiste em:

- **Backend**: Node.js + Express + PostgreSQL
- **Frontend**: React + Vite
- **Banco de Dados**: PostgreSQL

## 🎯 Opções de Deployment

### 1. **Render.com (Recomendado para iniciantes)**

- Gratuito para projetos pequenos
- Deploy automático do GitHub
- Banco PostgreSQL incluído
- SSL automático

### 2. **Railway.app**

- Interface simples
- Deploy rápido
- Banco PostgreSQL incluído

### 3. **Heroku**

- Mais robusto
- Requer cartão de crédito
- Excelente para aplicações maiores

### 4. **Vercel + Supabase**

- Vercel para frontend
- Supabase para backend e banco

## 🛠️ Preparação para Produção

### 1. Configurações de Ambiente

#### Backend (.env)

```env
# Produção
NODE_ENV=production
PORT=3001

# Banco de Dados
DB_HOST=seu-host-producao
DB_PORT=5432
DB_NAME=july_finance_prod
DB_USER=seu_usuario
DB_PASSWORD=sua_senha_forte

# JWT
JWT_SECRET=sua_chave_jwt_muito_secreta_e_longa
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://seu-dominio.com

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app
```

#### Frontend (.env.production)

```env
VITE_API_URL=https://seu-backend.com/api
```

### 2. Scripts de Build

#### Backend (package.json)

```json
{
  "scripts": {
    "start": "node server.js",
    "build": "npm install --production",
    "postinstall": "npm run db:migrate"
  }
}
```

#### Frontend (package.json)

```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

## 🚀 Deployment no Render.com

### Passo 1: Preparar o Repositório

1. **Criar arquivo `render.yaml` na raiz:**

```yaml
services:
  - type: web
    name: july-backend
    env: node
    buildCommand: cd backend && npm install
    startCommand: cd backend && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DB_HOST
        fromDatabase:
          name: july-database
          property: host
      - key: DB_NAME
        fromDatabase:
          name: july-database
          property: database
      - key: DB_USER
        fromDatabase:
          name: july-database
          property: user
      - key: DB_PASSWORD
        fromDatabase:
          name: july-database
          property: password

  - type: web
    name: july-frontend
    env: static
    buildCommand: cd july && npm install && npm run build
    staticPublishPath: ./july/dist
    envVars:
      - key: VITE_API_URL
        value: https://july-backend.onrender.com/api

databases:
  - name: july-database
    databaseName: july_finance
    user: july_user
```

### Passo 2: Configurar no Render

1. Acesse [render.com](https://render.com)
2. Conecte seu repositório GitHub
3. Crie um novo "Blueprint"
4. Selecione o arquivo `render.yaml`
5. Configure as variáveis de ambiente

### Passo 3: Configurar Banco de Dados

1. No Render, vá em "Databases"
2. Crie um novo PostgreSQL
3. Copie as credenciais para as variáveis de ambiente

## 🔧 Configurações de Segurança

### 1. Middleware de Segurança (Backend)

```javascript
// server.js
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite por IP
});

app.use(helmet());
app.use(limiter);
```

### 2. CORS Configurado

```javascript
// server.js
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
```

### 3. Variáveis de Ambiente

- **NUNCA** commite arquivos `.env`
- Use variáveis de ambiente do provedor
- Rotacione chaves JWT regularmente

## 📊 Monitoramento

### 1. Logs

- Configure logs estruturados
- Monitore erros 500
- Acompanhe performance

### 2. Health Check

```javascript
// routes/health.js
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});
```

## 🔄 CI/CD Pipeline

### GitHub Actions (.github/workflows/deploy.yml)

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: "18"
      - run: cd backend && npm install && npm test
      - run: cd july && npm install && npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      # Deploy automático para Render
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **Erro de CORS**

   - Verifique `CORS_ORIGIN` no backend
   - Confirme se o frontend está usando HTTPS

2. **Erro de Conexão com Banco**

   - Verifique credenciais do banco
   - Confirme se o banco está acessível

3. **Build Falha**

   - Verifique dependências
   - Confirme Node.js version

4. **Aplicação não carrega**
   - Verifique logs do servidor
   - Confirme se as portas estão corretas

## 📈 Próximos Passos

1. **Backup Automático**

   - Configure backup do banco
   - Teste restauração

2. **CDN**

   - Configure CDN para assets
   - Otimize imagens

3. **SSL**

   - Configure certificado SSL
   - Force HTTPS

4. **Monitoramento**
   - Configure alertas
   - Monitore performance

## 🆘 Suporte

- **Logs**: Verifique logs no painel do provedor
- **Documentação**: Consulte docs do provedor escolhido
- **Comunidade**: Stack Overflow, GitHub Issues

---

**🎉 Parabéns! Sua aplicação está pronta para produção!**
