# July - Aplicação de Gestão Financeira

Uma aplicação moderna de gestão financeira pessoal desenvolvida com React, Tailwind CSS e preparada para integração com PostgreSQL.

## 🚀 Funcionalidades

- **Autenticação completa**: Login, registro e gerenciamento de sessão
- **Dashboard interativo**: Visão geral das finanças com gráficos e métricas
- **Gestão de transações**: Adicionar, editar e categorizar receitas e despesas
- **Relatórios avançados**: Análise de gastos por categoria e período
- **Múltiplos planos**: Gratuito, Premium e Pro
- **Interface responsiva**: Design moderno e adaptável a todos os dispositivos

## 🛠️ Tecnologias

### Frontend

- **React 19** - Biblioteca JavaScript para interfaces
- **Tailwind CSS** - Framework CSS utilitário
- **Vite** - Build tool e dev server
- **Context API** - Gerenciamento de estado global

### Backend (Preparado para)

- **Node.js/Express** - Servidor API
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação baseada em tokens
- **bcrypt** - Criptografia de senhas

## 📦 Instalação

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- PostgreSQL (para o backend)

### Frontend

1. **Clone o repositório**

```bash
git clone <url-do-repositorio>
cd july
```

2. **Instale as dependências**

```bash
npm install
```

3. **Configure as variáveis de ambiente**
   Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_URL=http://localhost:3001/api
```

4. **Execute o projeto**

```bash
npm run dev
```

O projeto estará disponível em `http://localhost:5173`

## 🗄️ Configuração do Backend com PostgreSQL

### 1. Estrutura do Banco de Dados

Crie as seguintes tabelas no PostgreSQL:

```sql
-- Tabela de usuários
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    plan VARCHAR(50) DEFAULT 'free',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de categorias
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6',
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de contas bancárias
CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    balance DECIMAL(10,2) DEFAULT 0,
    color VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de transações
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    account_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    amount DECIMAL(10,2) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de metas financeiras
CREATE TABLE goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_amount DECIMAL(10,2) NOT NULL,
    current_amount DECIMAL(10,2) DEFAULT 0,
    deadline DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
```

### 2. Configuração do Backend

Crie um novo diretório para o backend:

```bash
mkdir july-backend
cd july-backend
npm init -y
```

Instale as dependências necessárias:

```bash
npm install express pg bcryptjs jsonwebtoken cors dotenv helmet morgan
npm install --save-dev nodemon
```

### 3. Estrutura do Backend

```
july-backend/
├── src/
│   ├── config/
│   │   └── database.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── transactionController.js
│   │   │   └── userController.js
│   │   │   ├── middleware/
│   │   │   │   ├── auth.js
│   │   │   │   └── validation.js
│   │   │   │   ├── routes/
│   │   │   │   │   ├── auth.js
│   │   │   │   │   ├── transactions.js
│   │   │   │   │   └── users.js
│   │   │   │   └── services/
│   │   │   │       └── database.js
│   │   │   └── app.js
│   │   └── .env
│   └── package.json
```

### 4. Configuração do Banco de Dados

```javascript
// src/config/database.js
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

module.exports = pool;
```

### 5. Variáveis de Ambiente do Backend

```env
# .env
PORT=3001
DB_USER=seu_usuario
DB_HOST=localhost
DB_NAME=july_db
DB_PASSWORD=sua_senha
DB_PORT=5432
JWT_SECRET=seu_jwt_secret_super_seguro
```

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia o servidor de desenvolvimento

# Build
npm run build        # Cria build de produção
npm run preview      # Visualiza o build de produção

# Linting
npm run lint         # Executa o ESLint
```

## 📱 Funcionalidades da Interface

### Tela de Login

- Formulário de login com validação
- Opção "Lembrar de mim"
- Link para recuperação de senha
- Login social (Google, Twitter)
- Navegação para cadastro

### Tela de Registro

- Formulário completo de cadastro
- Seleção de planos (Gratuito, Premium, Pro)
- Validação de senhas
- Termos de uso e política de privacidade

### Dashboard

- Visão geral das finanças
- Saldo total e variação percentual
- Receitas e despesas do mês
- Transações recentes
- Gráfico de gastos por categoria
- Botões para adicionar transações

## 🔐 Segurança

- Senhas criptografadas com bcrypt
- Autenticação JWT
- Validação de formulários
- Proteção contra CSRF
- Headers de segurança

## 🚀 Deploy

### Frontend (Vercel/Netlify)

```bash
npm run build
# Faça upload da pasta dist
```

### Backend (Heroku/Railway)

```bash
# Configure as variáveis de ambiente
# Deploy via Git
```

## 📄 Licença

Este projeto está sob a licença MIT.

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para suporte, envie um email para suporte@july.com ou abra uma issue no GitHub.
