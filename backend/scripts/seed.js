import { query } from "../config/database.js";
import bcrypt from "bcryptjs";

const seedData = async () => {
  try {
    console.log("🌱 Iniciando seed do banco de dados...");

    // Criar usuário de teste
    const hashedPassword = await bcrypt.hash("123456", 12);
    const userResult = await query(
      `
      INSERT INTO users (name, email, password, email_verified)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `,
      ["Usuário Teste", "teste@july.com", hashedPassword, true]
    );

    let userId;
    if (userResult.rows.length > 0) {
      userId = userResult.rows[0].id;
    } else {
      const existingUser = await query(
        "SELECT id FROM users WHERE email = $1",
        ["teste@july.com"]
      );
      userId = existingUser.rows[0].id;
    }

    console.log("✅ Usuário de teste criado");

    // Categorias padrão para despesas
    const expenseCategories = [
      { name: "Alimentação", color: "#EF4444", icon: "🍽️", type: "expense" },
      { name: "Transporte", color: "#F59E0B", icon: "🚗", type: "expense" },
      { name: "Moradia", color: "#10B981", icon: "🏠", type: "expense" },
      { name: "Saúde", color: "#3B82F6", icon: "🏥", type: "expense" },
      { name: "Educação", color: "#8B5CF6", icon: "📚", type: "expense" },
      { name: "Lazer", color: "#EC4899", icon: "🎮", type: "expense" },
      { name: "Vestuário", color: "#06B6D4", icon: "👕", type: "expense" },
      { name: "Outros", color: "#6B7280", icon: "📦", type: "expense" },
    ];

    // Categorias padrão para receitas
    const incomeCategories = [
      { name: "Salário", color: "#10B981", icon: "💰", type: "income" },
      { name: "Freelance", color: "#3B82F6", icon: "💼", type: "income" },
      { name: "Investimentos", color: "#8B5CF6", icon: "📈", type: "income" },
      { name: "Presentes", color: "#F59E0B", icon: "🎁", type: "income" },
      { name: "Outros", color: "#6B7280", icon: "📦", type: "income" },
    ];

    // Inserir categorias
    for (const category of [...expenseCategories, ...incomeCategories]) {
      await query(
        `
        INSERT INTO categories (user_id, name, color, icon, type, is_default)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT DO NOTHING
      `,
        [
          userId,
          category.name,
          category.color,
          category.icon,
          category.type,
          true,
        ]
      );
    }

    console.log("✅ Categorias padrão criadas");

    // Contas bancárias padrão
    const accounts = [
      {
        name: "Conta Principal",
        type: "Conta Corrente",
        balance: 5000.0,
        color: "#10B981",
      },
      {
        name: "Poupança",
        type: "Poupança",
        balance: 10000.0,
        color: "#3B82F6",
      },
      {
        name: "Cartão de Crédito",
        type: "Cartão de Crédito",
        balance: -1500.0,
        color: "#EF4444",
      },
      { name: "Carteira", type: "Dinheiro", balance: 500.0, color: "#F59E0B" },
    ];

    for (const account of accounts) {
      await query(
        `
        INSERT INTO accounts (user_id, name, type, balance, color)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT DO NOTHING
      `,
        [userId, account.name, account.type, account.balance, account.color]
      );
    }

    console.log("✅ Contas bancárias padrão criadas");

    // Buscar IDs das categorias e contas para criar transações
    const categories = await query(
      "SELECT id, name, type FROM categories WHERE user_id = $1",
      [userId]
    );
    const userAccounts = await query(
      "SELECT id, name FROM accounts WHERE user_id = $1",
      [userId]
    );

    // Transações de exemplo (mais realistas)
    const transactions = [
      {
        account_id: userAccounts.rows[0].id,
        category_id: categories.rows.find((c) => c.name === "Salário").id,
        description: "Salário do mês",
        amount: 5000.0,
        type: "income",
        date: new Date(),
      },
      {
        account_id: userAccounts.rows[0].id,
        category_id: categories.rows.find((c) => c.name === "Alimentação").id,
        description: "Supermercado semanal",
        amount: 250.0,
        type: "expense",
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 dias atrás
      },
      {
        account_id: userAccounts.rows[0].id,
        category_id: categories.rows.find((c) => c.name === "Transporte").id,
        description: "Combustível",
        amount: 180.0,
        type: "expense",
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 dias atrás
      },
      {
        account_id: userAccounts.rows[0].id,
        category_id: categories.rows.find((c) => c.name === "Lazer").id,
        description: "Cinema e jantar",
        amount: 120.0,
        type: "expense",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
      },
      {
        account_id: userAccounts.rows[1].id,
        category_id: categories.rows.find((c) => c.name === "Investimentos").id,
        description: "Aplicação na poupança",
        amount: 800.0,
        type: "expense",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 dias atrás
      },
      {
        account_id: userAccounts.rows[0].id,
        category_id: categories.rows.find((c) => c.name === "Freelance").id,
        description: "Projeto freelance",
        amount: 1500.0,
        type: "income",
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 dias atrás
      },
      {
        account_id: userAccounts.rows[0].id,
        category_id: categories.rows.find((c) => c.name === "Saúde").id,
        description: "Consulta médica",
        amount: 200.0,
        type: "expense",
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 dias atrás
      },
    ];

    for (const transaction of transactions) {
      await query(
        `
        INSERT INTO transactions (user_id, account_id, category_id, description, amount, type, date)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT DO NOTHING
      `,
        [
          userId,
          transaction.account_id,
          transaction.category_id,
          transaction.description,
          transaction.amount,
          transaction.type,
          transaction.date,
        ]
      );
    }

    console.log("✅ Transações de exemplo criadas");

    // Metas financeiras de exemplo
    const goals = [
      {
        name: "Viagem para Europa",
        target_amount: 15000.0,
        current_amount: 5000.0,
        deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 ano
        color: "#8B5CF6",
      },
      {
        name: "Entrada do apartamento",
        target_amount: 50000.0,
        current_amount: 15000.0,
        deadline: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000), // 2 anos
        color: "#10B981",
      },
    ];

    for (const goal of goals) {
      await query(
        `
        INSERT INTO goals (user_id, name, target_amount, current_amount, deadline, color)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT DO NOTHING
      `,
        [
          userId,
          goal.name,
          goal.target_amount,
          goal.current_amount,
          goal.deadline,
          goal.color,
        ]
      );
    }

    console.log("✅ Metas financeiras de exemplo criadas");

    console.log("🎉 Seed concluído com sucesso!");
    console.log("📧 Email de teste: teste@july.com");
    console.log("🔑 Senha: 123456");
  } catch (error) {
    console.error("❌ Erro no seed:", error);
    process.exit(1);
  }
};

// Executar seed
seedData();
