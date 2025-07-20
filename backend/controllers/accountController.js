import { query } from "../config/database.js";
import { validationResult } from "express-validator";

// Buscar todas as contas do usuário
export const getAccounts = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await query(
      `
      SELECT 
        id,
        name,
        type,
        balance,
        color,
        description,
        is_active,
        created_at,
        updated_at
      FROM accounts 
      WHERE user_id = $1
      ORDER BY name ASC
    `,
      [userId]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Erro ao buscar contas:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

// Buscar conta por ID
export const getAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await query(
      `
      SELECT 
        id,
        name,
        type,
        balance,
        color,
        description,
        is_active,
        created_at,
        updated_at
      FROM accounts 
      WHERE id = $1 AND user_id = $2
    `,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Conta não encontrada",
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao buscar conta:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

// Criar nova conta
export const createAccount = async (req, res) => {
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
    const { name, type, balance, color, description } = req.body;

    // Verificar se já existe uma conta com o mesmo nome para o usuário
    const existingAccount = await query(
      "SELECT id FROM accounts WHERE user_id = $1 AND name = $2",
      [userId, name]
    );

    if (existingAccount.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Já existe uma conta com este nome",
      });
    }

    const result = await query(
      `
      INSERT INTO accounts (user_id, name, type, balance, color, description, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING 
        id,
        name,
        type,
        balance,
        color,
        description,
        is_active,
        created_at,
        updated_at
    `,
      [userId, name, type, balance, color, description, true]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao criar conta:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

// Atualizar conta
export const updateAccount = async (req, res) => {
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
    const { name, type, balance, color, description } = req.body;

    // Verificar se a conta existe e pertence ao usuário
    const existingAccount = await query(
      "SELECT id FROM accounts WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (existingAccount.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Conta não encontrada",
      });
    }

    // Verificar se já existe outra conta com o mesmo nome
    const duplicateAccount = await query(
      "SELECT id FROM accounts WHERE user_id = $1 AND name = $2 AND id != $3",
      [userId, name, id]
    );

    if (duplicateAccount.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Já existe uma conta com este nome",
      });
    }

    const result = await query(
      `
      UPDATE accounts 
      SET name = $1, type = $2, balance = $3, color = $4, description = $5, updated_at = NOW()
      WHERE id = $6 AND user_id = $7
      RETURNING 
        id,
        name,
        type,
        balance,
        color,
        description,
        created_at,
        updated_at
    `,
      [name, type, balance, color, description, id, userId]
    );

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao atualizar conta:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

// Deletar conta
export const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar se a conta existe e pertence ao usuário
    const existingAccount = await query(
      "SELECT id FROM accounts WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (existingAccount.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Conta não encontrada",
      });
    }

    // Verificar se há transações usando esta conta
    const transactionsUsingAccount = await query(
      "SELECT COUNT(*) as count FROM transactions WHERE account_id = $1 AND user_id = $2",
      [id, userId]
    );

    if (parseInt(transactionsUsingAccount.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Não é possível deletar uma conta que possui transações associadas",
      });
    }

    await query("DELETE FROM accounts WHERE id = $1 AND user_id = $2", [
      id,
      userId,
    ]);

    res.json({
      success: true,
      message: "Conta deletada com sucesso",
    });
  } catch (error) {
    console.error("Erro ao deletar conta:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};
