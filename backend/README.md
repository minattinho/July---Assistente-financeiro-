# Backend - July Finance

Backend completo para aplicação de controle financeiro com PostgreSQL, Express e Node.js.

## 🚀 Funcionalidades

- ✅ Autenticação JWT
- ✅ CRUD de transações
- ✅ CRUD de categorias
- ✅ CRUD de contas bancárias
- ✅ CRUD de metas financeiras
- ✅ CRUD de orçamentos
- ✅ Relatórios financeiros
- ✅ Validação de dados
- ✅ Rate limiting
- ✅ Segurança com Helmet
- ✅ CORS configurado
- ✅ Logs estruturados

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL 12+
- npm ou yarn

## 🛠️ Instalação

1. **Clone o repositório**

```bash
git clone <url-do-repositorio>
cd platform/backend
```

2. **Instale as dependências**

```bash
npm install
```

3. **Configure o banco de dados**

```bash
# Crie um banco PostgreSQL chamado 'july_finance'
createdb july_finance
```

4. **Configure as variáveis de ambiente**

```bash
# Copie o arquivo de exemplo
cp env.example .env

# Edite o arquivo .env com suas configurações
nano .env
```

5. **Execute as migrações**

```bash
npm run db:migrate
```

6. **Popule o banco com dados de teste (opcional)**

```bash
npm run db:seed
```

7. **Inicie o servidor**

```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 🔧 Configuração das Variáveis de Ambiente

Crie um arquivo `.env` baseado no `env.example`:

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

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

- **users**: Usuários do sistema
- **categories**: Categorias de transações
- **accounts**: Contas bancárias
- **transactions**: Transações financeiras
- **goals**: Metas financeiras
- **budgets**: Orçamentos

### Relacionamentos

- Usuários têm muitas categorias, contas, transações, metas e orçamentos
- Transações pertencem a uma conta e podem ter uma categoria
- Orçamentos são vinculados a categorias

## 🔌 Endpoints da API

### Autenticação

```
POST /api/auth/register     - Registrar usuário
POST /api/auth/login        - Fazer login
GET  /api/auth/verify       - Verificar token
POST /api/auth/logout       - Fazer logout
POST /api/auth/forgot-password - Esqueci a senha
POST /api/auth/reset-password  - Resetar senha
GET  /api/auth/verify-email/:token - Verificar email
```

### Transações

```
GET    /api/transactions     - Listar transações
GET    /api/transactions/:id - Buscar transação
POST   /api/transactions     - Criar transação
PUT    /api/transactions/:id - Atualizar transação
DELETE /api/transactions/:id - Deletar transação
```

### Parâmetros de Filtro (Transações)

- `page`: Número da página (padrão: 1)
- `limit`: Itens por página (padrão: 20)
- `type`: Tipo de transação (income/expense)
- `category_id`: ID da categoria
- `account_id`: ID da conta
- `start_date`: Data inicial (YYYY-MM-DD)
- `end_date`: Data final (YYYY-MM-DD)
- `search`: Busca por descrição

## 🔐 Autenticação

A API usa JWT (JSON Web Tokens) para autenticação.

### Como usar:

1. Faça login ou registro para obter um token
2. Inclua o token no header das requisições:
   ```
   Authorization: Bearer <seu_token>
   ```

### Exemplo de uso:

```javascript
// Login
const response = await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "user@example.com", password: "123456" }),
});

const {
  data: { token },
} = await response.json();

// Usar token em requisições
const transactions = await fetch("/api/transactions", {
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});
```

## 📝 Exemplos de Uso

### Criar uma transação

```javascript
const transaction = {
  description: "Supermercado",
  amount: 150.5,
  type: "expense",
  date: "2024-01-15",
  account_id: 1,
  category_id: 1,
  notes: "Compras do mês",
};

const response = await fetch("/api/transactions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(transaction),
});
```

### Listar transações com filtros

```javascript
const params = new URLSearchParams({
  page: 1,
  limit: 10,
  type: "expense",
  start_date: "2024-01-01",
  end_date: "2024-01-31",
});

const response = await fetch(`/api/transactions?${params}`, {
  headers: { Authorization: `Bearer ${token}` },
});
```

## 🧪 Dados de Teste

Após executar `npm run db:seed`, você terá:

- **Usuário de teste**: teste@july.com / 123456
- **Categorias padrão**: Alimentação, Transporte, Moradia, etc.
- **Contas padrão**: Conta Principal, Poupança, Cartão de Crédito
- **Transações de exemplo**: Algumas transações para testar

## 🔒 Segurança

- Senhas criptografadas com bcrypt
- JWT para autenticação
- Rate limiting para prevenir spam
- Validação de dados com express-validator
- Headers de segurança com Helmet
- CORS configurado adequadamente

## 📈 Monitoramento

- Logs estruturados para todas as requisições
- Métricas de performance das queries
- Tratamento de erros centralizado
- Health check endpoint

## 🚀 Deploy

### Variáveis de Produção

```env
NODE_ENV=production
PORT=3001
DB_HOST=seu-host-postgresql
DB_NAME=july_finance_prod
JWT_SECRET=seu_secret_muito_seguro
```

### Comandos de Deploy

```bash
# Instalar dependências
npm ci --only=production

# Executar migrações
npm run db:migrate

# Iniciar servidor
npm start
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.
