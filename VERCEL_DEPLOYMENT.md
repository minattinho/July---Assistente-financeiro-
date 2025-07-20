# 🚀 Deploy na Vercel - July Finance

## 📋 Visão Geral

A Vercel é perfeita para o **frontend** da sua aplicação. Para uma solução completa, você pode usar:

- **Frontend**: Vercel (React/Vite)
- **Backend**: Render, Railway ou Heroku
- **Banco**: PostgreSQL (Render, Railway, Supabase, etc.)

## 🎯 Opções de Deployment

### Opção 1: Frontend Vercel + Backend Render (Recomendado)

#### Passo 1: Deploy do Backend no Render

```bash
# 1. Fazer commit das mudanças
git add .
git commit -m "Preparando backend para produção"
git push origin main

# 2. Deploy no Render
# - Acesse render.com
# - New → Blueprint
# - Conecte seu GitHub
# - Selecione render.yaml
# - Apply
```

#### Passo 2: Deploy do Frontend na Vercel

```bash
# 1. Instalar CLI da Vercel
npm install -g vercel

# 2. Login na Vercel
vercel login

# 3. Deploy do frontend
cd july
vercel --prod
```

### Opção 2: Deploy Automático via GitHub

1. **Conecte seu repositório na Vercel:**

   - Acesse [vercel.com](https://vercel.com)
   - Clique em "New Project"
   - Importe seu repositório GitHub
   - Configure:
     - **Framework Preset**: Vite
     - **Root Directory**: `july`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`

2. **Configure as variáveis de ambiente:**

   ```
   VITE_API_URL=https://seu-backend.onrender.com/api
   ```

3. **Deploy automático:**
   - A cada push para `main`, a Vercel fará deploy automático

## 🔧 Configuração Detalhada

### 1. Configurar Backend (Render)

Crie um arquivo `.env` no backend com:

```env
NODE_ENV=production
PORT=3001
JWT_SECRET=sua-chave-super-secreta
DB_HOST=seu-host-render
DB_PORT=5432
DB_NAME=july_finance
DB_USER=seu-usuario
DB_PASSWORD=sua-senha
CORS_ORIGIN=https://seu-app.vercel.app
```

### 2. Configurar Frontend (Vercel)

No painel da Vercel, configure as variáveis de ambiente:

```
VITE_API_URL=https://seu-backend.onrender.com/api
```

### 3. Configurar CORS no Backend

Atualize o CORS no `backend/server.js`:

```javascript
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://seu-app.vercel.app"]
        : ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);
```

## 🚀 Deploy Rápido

### Script Automático:

```powershell
# Deploy completo (backend + frontend)
.\deploy.ps1 vercel
```

### Deploy Manual:

```bash
# 1. Backend no Render
git push origin main

# 2. Frontend na Vercel
cd july
vercel --prod
```

## 🔐 Configurações de Segurança

### Vercel (Frontend):

- ✅ HTTPS automático
- ✅ Headers de segurança configurados
- ✅ Cache otimizado
- ✅ CDN global

### Render (Backend):

- ✅ HTTPS automático
- ✅ Rate limiting
- ✅ Helmet security
- ✅ CORS configurado

## 📊 Monitoramento

### Vercel Analytics:

- Performance insights
- Core Web Vitals
- User analytics
- Error tracking

### Render Monitoring:

- Logs em tempo real
- Health checks
- Performance metrics

## 🔄 CI/CD com GitHub Actions

```yaml
# .github/workflows/vercel-deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./july
```

## 🎯 Vantagens da Vercel

### ✅ Frontend:

- Deploy instantâneo
- CDN global
- HTTPS automático
- Preview deployments
- Analytics integrado
- Otimização automática

### ✅ Integração:

- GitHub automático
- Domínio personalizado
- SSL gratuito
- Edge functions
- Serverless functions

## 🚨 Troubleshooting

### Problema: Erro de CORS

**Solução:**

1. Verificar `CORS_ORIGIN` no backend
2. Incluir domínio da Vercel: `https://seu-app.vercel.app`

### Problema: API não responde

**Solução:**

1. Verificar se o backend está rodando no Render
2. Verificar URL da API no frontend
3. Testar endpoint diretamente

### Problema: Build falha na Vercel

**Solução:**

1. Verificar Node.js version (18+)
2. Verificar dependências no `package.json`
3. Verificar logs de build

## 📈 Próximos Passos

1. **Configurar domínio personalizado**
2. **Configurar analytics**
3. **Configurar preview deployments**
4. **Configurar edge functions** (se necessário)
5. **Configurar serverless functions** (se necessário)

## 🆘 Suporte

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel Community**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
- **Render Docs**: [docs.render.com](https://docs.render.com)

---

**🎉 Sua aplicação estará online com performance de nível empresarial!**
