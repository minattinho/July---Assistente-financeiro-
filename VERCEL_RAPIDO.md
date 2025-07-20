# ⚡ Deploy Rápido na Vercel

## 🎯 Deploy em 5 Minutos

### Passo 1: Preparar o Repositório

```bash
git add .
git commit -m "Preparando para Vercel"
git push origin main
```

### Passo 2: Deploy Automático

```powershell
# Instalar CLI da Vercel
npm install -g vercel

# Deploy automático
.\deploy.ps1 vercel
```

## 🚀 Deploy Manual (Interface Web)

### 1. Acesse a Vercel

- Vá para [vercel.com](https://vercel.com)
- Faça login com GitHub

### 2. Importe o Projeto

- Clique em "New Project"
- Selecione seu repositório GitHub
- Configure:
  - **Framework Preset**: `Vite`
  - **Root Directory**: `july`
  - **Build Command**: `npm run build`
  - **Output Directory**: `dist`

### 3. Configure Variáveis

```
VITE_API_URL=https://seu-backend.onrender.com/api
```

### 4. Deploy

- Clique em "Deploy"
- Aguarde 2-3 minutos

## 🔧 Configuração do Backend

### Opção 1: Render.com (Recomendado)

```bash
# Deploy do backend no Render
.\deploy.ps1 render
```

### Opção 2: Railway.app

```bash
# Deploy do backend no Railway
.\deploy.ps1 railway
```

## 🔐 Configurações Importantes

### Backend (.env)

```env
CORS_ORIGIN=https://seu-app.vercel.app
```

### Frontend (Vercel)

```
VITE_API_URL=https://seu-backend.onrender.com/api
```

## 🎉 Vantagens da Vercel

- ✅ **Deploy instantâneo** (2-3 minutos)
- ✅ **CDN global** (Edge Network)
- ✅ **HTTPS automático**
- ✅ **Preview deployments**
- ✅ **Analytics integrado**
- ✅ **Domínio gratuito**
- ✅ **GitHub automático**

## 🚨 Troubleshooting

### Erro: Build falha

```bash
# Verificar Node.js version
node --version  # Deve ser 18+

# Verificar dependências
cd july
npm install
npm run build
```

### Erro: API não responde

```bash
# Verificar se o backend está rodando
curl https://seu-backend.onrender.com/api/health

# Verificar URL da API
echo $VITE_API_URL
```

### Erro: CORS

```javascript
// No backend/server.js
CORS_ORIGIN=https://seu-app.vercel.app
```

## 📊 Monitoramento

### Vercel Analytics

- Performance insights
- Core Web Vitals
- User analytics
- Error tracking

### Acessar Analytics

- Painel da Vercel → Analytics
- Insights automáticos
- Relatórios detalhados

## 🔄 CI/CD Automático

### GitHub Actions

- Deploy automático a cada push
- Testes antes do deploy
- Preview deployments para PRs

### Configurar Secrets

1. GitHub → Settings → Secrets
2. Adicionar:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

## 🎯 Próximos Passos

1. **Configurar domínio personalizado**
2. **Configurar analytics**
3. **Configurar preview deployments**
4. **Configurar edge functions** (se necessário)

---

**🎉 Sua aplicação estará online com performance de nível empresarial!**
