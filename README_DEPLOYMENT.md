# 🚀 Guia Rápido de Deployment - July Finance

## ⚡ Deploy Rápido (Recomendado)

### 1. **Render.com (Mais Fácil)**

```powershell
# 1. Instalar CLI do Render
npm install -g @render/cli

# 2. Fazer login
render login

# 3. Deploy automático
.\deploy.ps1 render
```

### 2. **Railway.app (Alternativa)**

```powershell
# 1. Instalar CLI do Railway
npm install -g @railway/cli

# 2. Deploy automático
.\deploy.ps1 railway
```

### 3. **Docker Local (Para Testes)**

```powershell
# 1. Instalar Docker Desktop
# 2. Deploy local
.\deploy.ps1 docker
```

## 📋 Pré-requisitos

### Para Render/Railway:

- Conta no GitHub
- Conta no Render/Railway
- Node.js 18+ instalado

### Para Docker:

- Docker Desktop instalado
- Docker Compose instalado

## 🔧 Configuração Manual

### 1. **Render.com**

1. Acesse [render.com](https://render.com)
2. Clique em "New" → "Blueprint"
3. Conecte seu repositório GitHub
4. Selecione o arquivo `render.yaml`
5. Clique em "Apply"

### 2. **Railway.app**

1. Acesse [railway.app](https://railway.app)
2. Clique em "New Project"
3. Selecione "Deploy from GitHub repo"
4. Escolha seu repositório
5. Configure as variáveis de ambiente

### 3. **Heroku**

1. Instale o CLI: `npm install -g heroku`
2. Login: `heroku login`
3. Crie o app: `heroku create july-finance-app`
4. Configure variáveis:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=sua-chave-secreta
   heroku config:set DB_HOST=seu-host
   heroku config:set DB_NAME=seu-banco
   heroku config:set DB_USER=seu-usuario
   heroku config:set DB_PASSWORD=sua-senha
   ```
5. Deploy: `git push heroku main`

## 🔐 Variáveis de Ambiente

### Backend (.env)

```env
NODE_ENV=production
PORT=3001
JWT_SECRET=sua-chave-jwt-muito-secreta
JWT_EXPIRES_IN=7d
DB_HOST=seu-host-producao
DB_PORT=5432
DB_NAME=july_finance_prod
DB_USER=seu_usuario
DB_PASSWORD=sua_senha_forte
CORS_ORIGIN=https://seu-dominio.com
```

### Frontend (.env.production)

```env
VITE_API_URL=https://seu-backend.com/api
```

## 🗄️ Banco de Dados

### Opções de Banco:

1. **Render PostgreSQL** (Gratuito)

   - Incluído no plano gratuito
   - Configuração automática

2. **Railway PostgreSQL** (Gratuito)

   - Incluído no plano gratuito
   - Configuração automática

3. **Supabase** (Gratuito)

   - 500MB gratuitos
   - Interface web amigável

4. **Neon** (Gratuito)
   - PostgreSQL serverless
   - 3GB gratuitos

### Configuração Manual:

```sql
-- Conectar ao banco e executar:
CREATE DATABASE july_finance;
CREATE USER july_user WITH PASSWORD 'sua_senha_forte';
GRANT ALL PRIVILEGES ON DATABASE july_finance TO july_user;
```

## 🔍 Troubleshooting

### Problemas Comuns:

1. **Erro de CORS**

   ```
   Solução: Verificar CORS_ORIGIN no backend
   ```

2. **Erro de Conexão com Banco**

   ```
   Solução: Verificar credenciais e host do banco
   ```

3. **Build Falha**

   ```
   Solução: Verificar Node.js version (18+)
   ```

4. **Aplicação não carrega**
   ```
   Solução: Verificar logs no painel do provedor
   ```

### Comandos Úteis:

```bash
# Verificar logs
render logs

# Reiniciar aplicação
render restart

# Verificar status
render status
```

## 📊 Monitoramento

### Health Check:

- URL: `https://seu-app.com/api/health`
- Deve retornar status 200

### Logs:

- Render: Painel → Logs
- Railway: Painel → Deployments → Logs
- Heroku: `heroku logs --tail`

## 🔄 CI/CD

### GitHub Actions:

- Automático com push para `main`
- Testes antes do deploy
- Deploy automático após testes

### Configurar Secrets:

1. Vá em Settings → Secrets
2. Adicione:
   - `RENDER_API_KEY`
   - `RENDER_SERVICE_ID`
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

## 🎯 Próximos Passos

1. **Configurar Domínio Personalizado**
2. **Configurar SSL/HTTPS**
3. **Configurar Backup Automático**
4. **Configurar Monitoramento**
5. **Configurar CDN**

## 🆘 Suporte

- **Documentação**: [docs.render.com](https://docs.render.com)
- **Comunidade**: [Discord Render](https://discord.gg/render)
- **Issues**: GitHub Issues do projeto

---

**🎉 Sua aplicação está pronta para produção!**
