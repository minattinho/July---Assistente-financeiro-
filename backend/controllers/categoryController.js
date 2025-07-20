import { query } from "../config/database.js";
import { validationResult } from "express-validator";

// Buscar todas as categorias do usuário
export const getCategories = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.query;

    let conditions = ["user_id = $1"];
    let params = [userId];
    let paramCount = 1;

    if (type) {
      paramCount++;
      conditions.push(`type = $${paramCount}`);
      params.push(type);
    }

    const whereClause = conditions.join(" AND ");

    const result = await query(
      `
      SELECT 
        id,
        name,
        color,
        icon,
        type,
        is_default,
        created_at,
        updated_at
      FROM categories 
      WHERE ${whereClause}
      ORDER BY name ASC
    `,
      params
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

// Buscar categoria por ID
export const getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await query(
      `
      SELECT 
        id,
        name,
        color,
        icon,
        type,
        is_default,
        created_at,
        updated_at
      FROM categories 
      WHERE id = $1 AND user_id = $2
    `,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Categoria não encontrada",
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao buscar categoria:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

// Criar nova categoria
export const createCategory = async (req, res) => {
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
    const { name, color, icon, type } = req.body;

    // Verificar se já existe uma categoria com o mesmo nome para o usuário
    const existingCategory = await query(
      "SELECT id FROM categories WHERE user_id = $1 AND name = $2",
      [userId, name]
    );

    if (existingCategory.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Já existe uma categoria com este nome",
      });
    }

    const result = await query(
      `
      INSERT INTO categories (user_id, name, color, icon, type)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING 
        id,
        name,
        color,
        icon,
        type,
        is_default,
        created_at,
        updated_at
    `,
      [userId, name, color, icon, type]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao criar categoria:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

// Atualizar categoria
export const updateCategory = async (req, res) => {
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
    const { name, color, icon, type } = req.body;

    // Verificar se a categoria existe e pertence ao usuário
    const existingCategory = await query(
      "SELECT id, is_default FROM categories WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (existingCategory.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Categoria não encontrada",
      });
    }

    // Não permitir editar categorias padrão
    if (existingCategory.rows[0].is_default) {
      return res.status(400).json({
        success: false,
        message: "Não é possível editar categorias padrão",
      });
    }

    // Verificar se já existe outra categoria com o mesmo nome
    const duplicateCategory = await query(
      "SELECT id FROM categories WHERE user_id = $1 AND name = $2 AND id != $3",
      [userId, name, id]
    );

    if (duplicateCategory.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Já existe uma categoria com este nome",
      });
    }

    const result = await query(
      `
      UPDATE categories 
      SET name = $1, color = $2, icon = $3, type = $4, updated_at = NOW()
      WHERE id = $5 AND user_id = $6
      RETURNING 
        id,
        name,
        color,
        icon,
        type,
        is_default,
        created_at,
        updated_at
    `,
      [name, color, icon, type, id, userId]
    );

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

// Deletar categoria
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar se a categoria existe e pertence ao usuário
    const existingCategory = await query(
      "SELECT id, is_default FROM categories WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (existingCategory.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Categoria não encontrada",
      });
    }

    // Não permitir deletar categorias padrão
    if (existingCategory.rows[0].is_default) {
      return res.status(400).json({
        success: false,
        message: "Não é possível deletar categorias padrão",
      });
    }

    // Verificar se há transações usando esta categoria
    const transactionsUsingCategory = await query(
      "SELECT COUNT(*) as count FROM transactions WHERE category_id = $1 AND user_id = $2",
      [id, userId]
    );

    if (parseInt(transactionsUsingCategory.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Não é possível deletar uma categoria que possui transações associadas",
      });
    }

    await query("DELETE FROM categories WHERE id = $1 AND user_id = $2", [
      id,
      userId,
    ]);

    res.json({
      success: true,
      message: "Categoria deletada com sucesso",
    });
  } catch (error) {
    console.error("Erro ao deletar categoria:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};
