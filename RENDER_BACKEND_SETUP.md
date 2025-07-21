# 🚀 Configurar Backend no Render

## 📋 Passo a Passo Completo

### 1. **Acessar o Render**

- Vá para [render.com](https://render.com)
- Faça login com sua conta GitHub

### 2. **Criar Blueprint**

- Clique em **"New"** → **"Blueprint"**
- Conecte seu repositório GitHub
- Selecione o arquivo `render.yaml`
- Clique em **"Apply"**

### 3. **Aguardar Deploy**

- O Render criará automaticamente:
  - ✅ Backend (Node.js)
  - ✅ Frontend (Static Site)
  - ✅ Banco PostgreSQL

### 4. **Configurar Variáveis de Ambiente**

#### **No Painel do Render → Backend → Environment:**

```
NODE_ENV=production
JWT_SECRET=sua-chave-super-secreta-e-longa-de-pelo-menos-32-caracteres
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://seu-app.vercel.app
```

#### **Banco de Dados (Automático):**

O Render configurará automaticamente:

```
DB_HOST=seu-host-render
DB_PORT=5432
DB_NAME=july_finance
DB_USER=seu-usuario
DB_PASSWORD=sua-senha
```

### 5. **Atualizar Frontend (Vercel)**

#### **No Painel da Vercel → Settings → Environment Variables:**

```
VITE_API_URL=https://seu-backend.onrender.com/api
```

### 6. **Testar Conexão**

#### **Health Check:**

```
https://seu-backend.onrender.com/api/health
```

#### **Deve retornar:**

```json
{
  "success": true,
  "message": "API funcionando corretamente",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production"
}
```

## 🔧 Configurações Avançadas

### **Rate Limiting:**

```
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### **Email (Opcional):**

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app
```

## 🚨 Troubleshooting

### **Problema: Deploy falha**

**Solução:**

1. Verificar logs no painel do Render
2. Verificar se todas as dependências estão no `package.json`
3. Verificar Node.js version (18+)

### **Problema: Banco não conecta**

**Solução:**

1. Verificar se o banco foi criado
2. Verificar variáveis de ambiente
3. Verificar se as migrations rodaram

### **Problema: CORS error**

**Solução:**

1. Verificar `CORS_ORIGIN` no backend
2. Incluir domínio da Vercel: `https://seu-app.vercel.app`

### **Problema: Frontend não carrega**

**Solução:**

1. Verificar `VITE_API_URL` no frontend
2. Verificar se o backend está rodando
3. Verificar logs da Vercel

## 📊 Monitoramento

### **Logs do Render:**

- Painel → Backend → Logs
- Logs em tempo real
- Histórico de erros

### **Health Check:**

- URL: `https://seu-backend.onrender.com/api/health`
- Deve retornar status 200

### **Métricas:**

- Uptime
- Response time
- Error rate

## 🔄 Deploy Automático

### **GitHub Integration:**

- Push para `main` = deploy automático
- Preview deployments para PRs
- Rollback fácil

### **Configurar Webhooks:**

- Render → Backend → Settings → Webhooks
- Notificações de deploy

## 🎯 URLs Finais

### **Frontend (Vercel):**

```
https://seu-app.vercel.app
```

### **Backend (Render):**

```
https://seu-backend.onrender.com
```

### **API Endpoints:**

```
https://seu-backend.onrender.com/api/health
https://seu-backend.onrender.com/api/auth
https://seu-backend.onrender.com/api/transactions
```

## 🆘 Suporte

- **Render Docs**: [docs.render.com](https://docs.render.com)
- **Render Community**: [discord.gg/render](https://discord.gg/render)
- **Status Page**: [status.render.com](https://status.render.com)

---

**🎉 Seu backend estará online e conectado ao frontend da Vercel!**
