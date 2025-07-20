#!/usr/bin/env node

import { execSync } from "child_process";
import { existsSync, copyFileSync, writeFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log(
  "🚀 Configurando July Finance - Backend PostgreSQL + Frontend React"
);
console.log("=".repeat(60));

// Verificar se Node.js está instalado
try {
  const nodeVersion = execSync("node --version", { encoding: "utf8" }).trim();
  console.log(`✅ Node.js ${nodeVersion} encontrado`);
} catch (error) {
  console.error("❌ Node.js não encontrado. Instale o Node.js 18+ primeiro.");
  process.exit(1);
}

// Verificar se PostgreSQL está instalado
try {
  execSync("psql --version", { encoding: "utf8" });
  console.log("✅ PostgreSQL encontrado");
} catch (error) {
  console.error("❌ PostgreSQL não encontrado. Instale o PostgreSQL primeiro.");
  console.log("💡 Você pode baixar em: https://www.postgresql.org/download/");
  process.exit(1);
}

// Configurar backend
console.log("\n📦 Configurando backend...");
const backendPath = join(__dirname, "backend");

if (!existsSync(backendPath)) {
  console.error("❌ Pasta backend não encontrada");
  process.exit(1);
}

try {
  // Instalar dependências do backend
  console.log("📥 Instalando dependências do backend...");
  execSync("npm install", { cwd: backendPath, stdio: "inherit" });
  console.log("✅ Dependências do backend instaladas");

  // Criar arquivo .env se não existir
  const envPath = join(backendPath, ".env");
  const envExamplePath = join(backendPath, "env.example");

  if (!existsSync(envPath) && existsSync(envExamplePath)) {
    copyFileSync(envExamplePath, envPath);
    console.log("✅ Arquivo .env criado (baseado no env.example)");
    console.log("⚠️  Lembre-se de configurar as variáveis no arquivo .env");
  }
} catch (error) {
  console.error("❌ Erro ao configurar backend:", error.message);
  process.exit(1);
}

// Configurar frontend
console.log("\n⚛️  Configurando frontend...");
const frontendPath = join(__dirname, "july");

if (!existsSync(frontendPath)) {
  console.error("❌ Pasta july (frontend) não encontrada");
  process.exit(1);
}

try {
  // Instalar dependências do frontend
  console.log("📥 Instalando dependências do frontend...");
  execSync("npm install", { cwd: frontendPath, stdio: "inherit" });
  console.log("✅ Dependências do frontend instaladas");
} catch (error) {
  console.error("❌ Erro ao configurar frontend:", error.message);
  process.exit(1);
}

// Criar banco de dados
console.log("\n🗄️  Configurando banco de dados...");
try {
  // Tentar criar o banco de dados
  execSync("createdb july_finance", { stdio: "pipe" });
  console.log('✅ Banco de dados "july_finance" criado');
} catch (error) {
  console.log("⚠️  Banco de dados já existe ou erro na criação");
  console.log("💡 Certifique-se de que o PostgreSQL está rodando");
}

// Executar migrações
console.log("\n🔄 Executando migrações...");
try {
  execSync("npm run db:migrate", { cwd: backendPath, stdio: "inherit" });
  console.log("✅ Migrações executadas com sucesso");
} catch (error) {
  console.error("❌ Erro ao executar migrações:", error.message);
  console.log(
    "💡 Verifique se o PostgreSQL está rodando e as configurações no .env"
  );
}

// Executar seed (opcional)
console.log("\n🌱 Executando seed (dados de teste)...");
try {
  execSync("npm run db:seed", { cwd: backendPath, stdio: "inherit" });
  console.log("✅ Dados de teste inseridos");
} catch (error) {
  console.error("❌ Erro ao executar seed:", error.message);
}

// Criar scripts de desenvolvimento
console.log("\n📝 Criando scripts de desenvolvimento...");

const packageJsonPath = join(__dirname, "package.json");
const packageJson = {
  name: "july-finance",
  version: "1.0.0",
  description: "Aplicação de controle financeiro com PostgreSQL",
  scripts: {
    dev: 'concurrently "npm run dev:backend" "npm run dev:frontend"',
    "dev:backend": "cd backend && npm run dev",
    "dev:frontend": "cd july && npm run dev",
    build: "cd july && npm run build",
    "install:all":
      "npm install && cd backend && npm install && cd ../july && npm install",
    "db:migrate": "cd backend && npm run db:migrate",
    "db:seed": "cd backend && npm run db:seed",
    "start:backend": "cd backend && npm start",
    "start:frontend": "cd july && npm run preview",
  },
  devDependencies: {
    concurrently: "^8.2.2",
  },
  keywords: ["finance", "postgresql", "react", "nodejs"],
  author: "Seu Nome",
  license: "MIT",
};

writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log("✅ package.json raiz criado");

// Instalar concurrently
try {
  execSync("npm install", { stdio: "inherit" });
  console.log("✅ Dependências raiz instaladas");
} catch (error) {
  console.error("❌ Erro ao instalar dependências raiz:", error.message);
}

// Criar README principal
console.log("\n📖 Criando README principal...");
const readmeContent = `# July Finance - Controle Financeiro

Aplicação completa de controle financeiro com backend PostgreSQL e frontend React.

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 18+
- PostgreSQL 12+

### Instalação
\`\`\`bash
# Instalar todas as dependências
npm run install:all

# Configurar banco de dados (criar .env no backend primeiro)
npm run db:migrate
npm run db:seed

# Iniciar desenvolvimento
npm run dev
\`\`\`

## 📁 Estrutura do Projeto

\`\`\`
platform/
├── backend/          # API Node.js + PostgreSQL
├── july/            # Frontend React
└── setup.js         # Script de configuração
\`\`\`

## 🔧 Configuração

1. **Backend**: Configure o arquivo \`backend/.env\` com suas credenciais do PostgreSQL
2. **Frontend**: O frontend já está configurado para se conectar com o backend na porta 3001

## 🧪 Dados de Teste

Após executar \`npm run db:seed\`:
- **Email**: teste@july.com
- **Senha**: 123456

## 📚 Documentação

- [Backend](./backend/README.md)
- [Frontend](./july/README.md)

## 🚀 Scripts Disponíveis

- \`npm run dev\` - Inicia backend e frontend em desenvolvimento
- \`npm run dev:backend\` - Inicia apenas o backend
- \`npm run dev:frontend\` - Inicia apenas o frontend
- \`npm run db:migrate\` - Executa migrações do banco
- \`npm run db:seed\` - Popula banco com dados de teste
- \`npm run build\` - Build do frontend para produção

## 🔗 URLs

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- **API Health**: http://localhost:3001/api/health
`;

writeFileSync(join(__dirname, "README.md"), readmeContent);
console.log("✅ README principal criado");

console.log("\n🎉 Configuração concluída!");
console.log("=".repeat(60));
console.log("\n📋 Próximos passos:");
console.log(
  "1. Configure o arquivo backend/.env com suas credenciais do PostgreSQL"
);
console.log("2. Execute: npm run dev");
console.log("3. Acesse: http://localhost:5173");
console.log("\n📧 Dados de teste: teste@july.com / 123456");
console.log("\n🔗 URLs:");
console.log("- Frontend: http://localhost:5173");
console.log("- Backend: http://localhost:3001");
console.log("- API Health: http://localhost:3001/api/health");
