# 🚀 Primeiro Uso - July Finance

Este guia vai te ajudar a configurar e executar a aplicação July Finance pela primeira vez.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

1. **Node.js 18+** - [Download aqui](https://nodejs.org/)
2. **PostgreSQL 12+** - [Download aqui](https://www.postgresql.org/download/)

## 🛠️ Configuração Rápida

### 1. Instalar Dependências

```bash
# Na pasta raiz do projeto
npm run install:all
```

### 2. Configurar Banco de Dados

1. **Inicie o PostgreSQL** (se não estiver rodando)
2. **Configure o arquivo `.env`**:

```bash
# Copie o arquivo de exemplo
cp backend/env.example backend/.env

# Edite o arquivo com suas configurações
nano backend/.env
```

Exemplo de configuração do `.env`:

```env
# Configurações do Servidor
PORT=3001
NODE_ENV=development

# Configurações do PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=july_finance
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui

# Configurações de Autenticação
JWT_SECRET=seu_jwt_secret_super_seguro_aqui
JWT_EXPIRES_IN=7d

# Configurações de Segurança
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Criar Banco e Executar Migrações

```bash
# Criar banco de dados
createdb july_finance

# Executar migrações
npm run db:migrate

# Popular com dados de teste (opcional)
npm run db:seed
```

### 4. Iniciar Aplicação

```bash
# Iniciar backend e frontend simultaneamente
npm run dev
```

## 🔗 URLs de Acesso

Após iniciar a aplicação:

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- **API Health**: http://localhost:3001/api/health

## 🧪 Dados de Teste

Se você executou o seed, pode fazer login com:

- **Email**: teste@july.com
- **Senha**: 123456

## 🚨 Solução de Problemas

### Erro de Conexão com PostgreSQL

```bash
# Verificar se o PostgreSQL está rodando
sudo systemctl status postgresql

# Iniciar PostgreSQL (Linux)
sudo systemctl start postgresql

# Windows: Verifique se o serviço está rodando
```

### Erro de Porta em Uso

```bash
# Verificar processos na porta 3001
lsof -i :3001

# Matar processo se necessário
kill -9 <PID>
```

### Erro de Permissão no Banco

```bash
# Conectar como superusuário
sudo -u postgres psql

# Criar usuário e banco
CREATE USER seu_usuario WITH PASSWORD 'sua_senha';
CREATE DATABASE july_finance OWNER seu_usuario;
GRANT ALL PRIVILEGES ON DATABASE july_finance TO seu_usuario;
\q
```

## 📁 Estrutura do Projeto

```
platform/
├── backend/              # API Node.js + PostgreSQL
│   ├── config/          # Configurações do banco
│   ├── controllers/     # Controladores da API
│   ├── middleware/      # Middlewares (auth, etc.)
│   ├── routes/          # Rotas da API
│   ├── scripts/         # Scripts de migração e seed
│   └── server.js        # Servidor principal
├── july/                # Frontend React
│   ├── src/
│   │   ├── components/  # Componentes React
│   │   ├── contexts/    # Contextos (AuthContext)
│   │   ├── hooks/       # Hooks customizados
│   │   └── services/    # Serviços de API
│   └── package.json
└── setup.js             # Script de configuração
```

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Backend + Frontend
npm run dev:backend      # Apenas backend
npm run dev:frontend     # Apenas frontend

# Banco de dados
npm run db:migrate       # Executar migrações
npm run db:seed          # Popular dados de teste

# Produção
npm run build            # Build do frontend
npm run start:backend    # Backend em produção
npm run start:frontend   # Frontend em produção
```

## 📚 Próximos Passos

1. **Explore a aplicação** - Faça login e teste as funcionalidades
2. **Personalize** - Modifique cores, textos e funcionalidades
3. **Adicione features** - Implemente novas funcionalidades
4. **Deploy** - Configure para produção

## 🆘 Precisa de Ajuda?

- Verifique os logs no terminal
- Consulte a documentação do [Backend](./backend/README.md)
- Verifique se todas as dependências estão instaladas
- Certifique-se de que o PostgreSQL está rodando

---

**🎉 Parabéns!** Sua aplicação July Finance está pronta para uso!
