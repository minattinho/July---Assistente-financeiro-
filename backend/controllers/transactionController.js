import { query } from "../config/database.js";
import { validationResult } from "express-validator";

// Buscar todas as transações do usuário
export const getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      page = 1,
      limit = 20,
      type,
      category_id,
      account_id,
      start_date,
      end_date,
      search,
    } = req.query;

    const offset = (page - 1) * limit;
    const conditions = ["t.user_id = $1"];
    const params = [userId];
    let paramCount = 1;

    // Filtros
    if (type) {
      paramCount++;
      conditions.push(`t.type = $${paramCount}`);
      params.push(type);
    }

    if (category_id) {
      paramCount++;
      conditions.push(`t.category_id = $${paramCount}`);
      params.push(category_id);
    }

    if (account_id) {
      paramCount++;
      conditions.push(`t.account_id = $${paramCount}`);
      params.push(account_id);
    }

    if (start_date) {
      paramCount++;
      conditions.push(`t.date >= $${paramCount}`);
      params.push(start_date);
    }

    if (end_date) {
      paramCount++;
      conditions.push(`t.date <= $${paramCount}`);
      params.push(end_date);
    }

    if (search) {
      paramCount++;
      conditions.push(`t.description ILIKE $${paramCount}`);
      params.push(`%${search}%`);
    }

    const whereClause = conditions.join(" AND ");

    // Query principal
    const result = await query(
      `
      SELECT 
        t.id,
        t.description,
        t.amount,
        t.type,
        t.date,
        t.notes,
        t.is_recurring,
        t.recurring_frequency,
        t.recurring_end_date,
        t.created_at,
        t.updated_at,
        c.id as category_id,
        c.name as category_name,
        c.color as category_color,
        c.icon as category_icon,
        a.id as account_id,
        a.name as account_name,
        a.color as account_color
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN accounts a ON t.account_id = a.id
      WHERE ${whereClause}
      ORDER BY t.date DESC, t.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `,
      [...params, limit, offset]
    );

    // Contar total de registros
    const countResult = await query(
      `
      SELECT COUNT(*) as total
      FROM transactions t
      WHERE ${whereClause}
    `,
      params
    );

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        transactions: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages,
        },
      },
    });
  } catch (error) {
    console.error("Erro ao buscar transações:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

// Buscar transação por ID
export const getTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await query(
      `
      SELECT 
        t.id,
        t.description,
        t.amount,
        t.type,
        t.date,
        t.notes,
        t.is_recurring,
        t.recurring_frequency,
        t.recurring_end_date,
        t.created_at,
        t.updated_at,
        c.id as category_id,
        c.name as category_name,
        c.color as category_color,
        c.icon as category_icon,
        a.id as account_id,
        a.name as account_name,
        a.color as account_color
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN accounts a ON t.account_id = a.id
      WHERE t.id = $1 AND t.user_id = $2
    `,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Transação não encontrada",
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao buscar transação:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

// Criar nova transação
export const createTransaction = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Dados inválidos",
        errors: errors.array(),
      });
    }

    const userId = req.user.id;
    const {
      account_id,
      category_id,
      description,
      amount,
      type,
      date,
      notes,
      is_recurring,
      recurring_frequency,
      recurring_end_date,
    } = req.body;
    const { parcelas } = req.body; // novo campo para número de parcelas

    // Verificar se a conta pertence ao usuário
    if (account_id) {
      const accountCheck = await query(
        "SELECT id FROM accounts WHERE id = $1 AND user_id = $2",
        [account_id, userId]
      );
      if (accountCheck.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Conta inválida",
        });
      }
    }

    // Verificar se a categoria pertence ao usuário
    if (category_id) {
      const categoryCheck = await query(
        "SELECT id FROM categories WHERE id = $1 AND user_id = $2",
        [category_id, userId]
      );
      if (categoryCheck.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Categoria inválida",
        });
      }
    }

    // Parcelamento de despesas
    let transacoesCriadas = [];
    if (type === "expense" && parcelas && Number(parcelas) > 1) {
      const totalParcelas = Number(parcelas);
      const valorParcela = Number(amount) / totalParcelas;
      let dataBase = new Date(date);
      for (let i = 1; i <= totalParcelas; i++) {
        // Ajusta a data para cada parcela (mês a mês)
        const dataParcela = new Date(dataBase);
        dataParcela.setMonth(dataBase.getMonth() + (i - 1));
        const result = await query(
          `
          INSERT INTO transactions (
            user_id, account_id, category_id, description, amount, type, date, notes,
            is_recurring, recurring_frequency, recurring_end_date, parcela_atual, total_parcelas
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          RETURNING id
        `,
          [
            userId,
            account_id,
            category_id,
            description + ` (${i}/${totalParcelas})`,
            valorParcela,
            type,
            dataParcela,
            notes,
            is_recurring,
            recurring_frequency,
            recurring_end_date,
            i,
            totalParcelas,
          ]
        );
        // Buscar transação criada
        const transactionResult = await query(
          `
          SELECT 
            t.id,
            t.description,
            t.amount,
            t.type,
            t.date,
            t.notes,
            t.is_recurring,
            t.recurring_frequency,
            t.recurring_end_date,
            t.parcela_atual,
            t.total_parcelas,
            t.created_at,
            t.updated_at,
            c.id as category_id,
            c.name as category_name,
            c.color as category_color,
            c.icon as category_icon,
            a.id as account_id,
            a.name as account_name,
            a.color as account_color
          FROM transactions t
          LEFT JOIN categories c ON t.category_id = c.id
          LEFT JOIN accounts a ON t.account_id = a.id
          WHERE t.id = $1
        `,
          [result.rows[0].id]
        );
        transacoesCriadas.push(transactionResult.rows[0]);
      }
      return res.status(201).json({
        success: true,
        message: "Transações parceladas criadas com sucesso",
        data: transacoesCriadas,
      });
    }
    // Inserir transação normal (sem parcelamento)
    const result = await query(
      `
      INSERT INTO transactions (
        user_id, account_id, category_id, description, amount, type, date, notes,
        is_recurring, recurring_frequency, recurring_end_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id
    `,
      [
        userId,
        account_id,
        category_id,
        description,
        amount,
        type,
        date,
        notes,
        is_recurring,
        recurring_frequency,
        recurring_end_date,
      ]
    );

    // Buscar transação criada com dados relacionados
    const transactionResult = await query(
      `
      SELECT 
        t.id,
        t.description,
        t.amount,
        t.type,
        t.date,
        t.notes,
        t.is_recurring,
        t.recurring_frequency,
        t.recurring_end_date,
        t.created_at,
        t.updated_at,
        c.id as category_id,
        c.name as category_name,
        c.color as category_color,
        c.icon as category_icon,
        a.id as account_id,
        a.name as account_name,
        a.color as account_color
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN accounts a ON t.account_id = a.id
      WHERE t.id = $1
    `,
      [result.rows[0].id]
    );

    res.status(201).json({
      success: true,
      message: "Transação criada com sucesso",
      data: transactionResult.rows[0],
    });
  } catch (error) {
    console.error("Erro ao criar transação:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

// Atualizar transação
export const updateTransaction = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Dados inválidos",
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const userId = req.user.id;
    const {
      account_id,
      category_id,
      description,
      amount,
      type,
      date,
      notes,
      is_recurring,
      recurring_frequency,
      recurring_end_date,
    } = req.body;

    // Verificar se a transação existe e pertence ao usuário
    const existingTransaction = await query(
      "SELECT id FROM transactions WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (existingTransaction.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Transação não encontrada",
      });
    }

    // Verificar se a conta pertence ao usuário
    if (account_id) {
      const accountCheck = await query(
        "SELECT id FROM accounts WHERE id = $1 AND user_id = $2",
        [account_id, userId]
      );
      if (accountCheck.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Conta inválida",
        });
      }
    }

    // Verificar se a categoria pertence ao usuário
    if (category_id) {
      const categoryCheck = await query(
        "SELECT id FROM categories WHERE id = $1 AND user_id = $2",
        [category_id, userId]
      );
      if (categoryCheck.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Categoria inválida",
        });
      }
    }

    // Atualizar transação
    await query(
      `
      UPDATE transactions 
      SET 
        account_id = $1,
        category_id = $2,
        description = $3,
        amount = $4,
        type = $5,
        date = $6,
        notes = $7,
        is_recurring = $8,
        recurring_frequency = $9,
        recurring_end_date = $10,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $11 AND user_id = $12
    `,
      [
        account_id,
        category_id,
        description,
        amount,
        type,
        date,
        notes,
        is_recurring,
        recurring_frequency,
        recurring_end_date,
        id,
        userId,
      ]
    );

    // Buscar transação atualizada
    const result = await query(
      `
      SELECT 
        t.id,
        t.description,
        t.amount,
        t.type,
        t.date,
        t.notes,
        t.is_recurring,
        t.recurring_frequency,
        t.recurring_end_date,
        t.created_at,
        t.updated_at,
        c.id as category_id,
        c.name as category_name,
        c.color as category_color,
        c.icon as category_icon,
        a.id as account_id,
        a.name as account_name,
        a.color as account_color
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN accounts a ON t.account_id = a.id
      WHERE t.id = $1
    `,
      [id]
    );

    res.json({
      success: true,
      message: "Transação atualizada com sucesso",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao atualizar transação:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

// Deletar transação
export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar se a transação existe e pertence ao usuário
    const existingTransaction = await query(
      "SELECT id FROM transactions WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (existingTransaction.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Transação não encontrada",
      });
    }

    // Deletar transação
    await query("DELETE FROM transactions WHERE id = $1 AND user_id = $2", [
      id,
      userId,
    ]);

    res.json({
      success: true,
      message: "Transação deletada com sucesso",
    });
  } catch (error) {
    console.error("Erro ao deletar transação:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};
