import { query } from "../config/database.js";

const createTables = async () => {
  try {
    console.log("🚀 Iniciando migração do banco de dados...");

    // Tabela de usuários
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        avatar_url VARCHAR(500),
        is_active BOOLEAN DEFAULT true,
        email_verified BOOLEAN DEFAULT false,
        verification_token VARCHAR(255),
        reset_password_token VARCHAR(255),
        reset_password_expires TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Tabela users criada");

    // Tabela de categorias
    await query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        color VARCHAR(7) DEFAULT '#3B82F6',
        icon VARCHAR(50),
        type VARCHAR(10) CHECK (type IN ('income', 'expense')) NOT NULL,
        is_default BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Tabela categories criada");

    // Tabela de contas bancárias
    await query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(50) NOT NULL,
        balance DECIMAL(15,2) DEFAULT 0.00,
        currency VARCHAR(3) DEFAULT 'BRL',
        color VARCHAR(7) DEFAULT '#10B981',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Tabela accounts criada");

    // Tabela de transações
    await query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        account_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE,
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        description VARCHAR(255) NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        type VARCHAR(10) CHECK (type IN ('income', 'expense')) NOT NULL,
        date DATE NOT NULL,
        notes TEXT,
        is_recurring BOOLEAN DEFAULT false,
        recurring_frequency VARCHAR(20),
        recurring_end_date DATE,
        parcela_atual INTEGER, -- número da parcela (ex: 1, 2, 3...)
        total_parcelas INTEGER, -- total de parcelas
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Tabela transactions criada");

    // Tabela de metas financeiras
    await query(`
      CREATE TABLE IF NOT EXISTS goals (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        subtitle VARCHAR(255),
        description TEXT,
        tags TEXT[],
        priority VARCHAR(20),
        category VARCHAR(50),
        type VARCHAR(20) CHECK (type IN ('economia', 'controle', 'investimento')) NOT NULL DEFAULT 'economia',
        target_amount DECIMAL(15,2) NOT NULL,
        current_amount DECIMAL(15,2) DEFAULT 0.00,
        meta_month DECIMAL(15,2),
        current_month DECIMAL(15,2),
        difference DECIMAL(15,2),
        deadline DATE,
        color VARCHAR(7) DEFAULT '#8B5CF6',
        is_completed BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Tabela goals criada/atualizada");

    // Tabela de orçamentos
    await query(`
      CREATE TABLE IF NOT EXISTS budgets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
        amount DECIMAL(15,2) NOT NULL,
        period VARCHAR(10) CHECK (period IN ('month', 'year')) DEFAULT 'month',
        year INTEGER NOT NULL,
        month INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Tabela budgets criada");

    // Índices para melhor performance
    await query(
      `CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id)`
    );
    await query(
      `CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date)`
    );
    await query(
      `CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id)`
    );
    await query(
      `CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id)`
    );
    await query(
      `CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id)`
    );
    await query(
      `CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id)`
    );
    await query(
      `CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id)`
    );
    await query(
      `CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id)`
    );

    console.log("✅ Índices criados");

    console.log("🎉 Migração concluída com sucesso!");
  } catch (error) {
    console.error("❌ Erro na migração:", error);
    process.exit(1);
  }
};

// Executar migração
createTables();
