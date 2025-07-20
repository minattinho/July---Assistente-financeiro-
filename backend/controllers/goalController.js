import { query } from "../config/database.js";
import { validationResult } from "express-validator";

// Lista de categorias permitidas para meta
const META_CATEGORIES = [
  "Viagem",
  "Reserva de Emergência",
  "Educação",
  "Aposentadoria",
  "Compra de Imóvel",
  "Compra de Carro",
  "Casamento",
  "Investimento",
  "Saúde",
  "Outros",
];

// Listar todas as metas do usuário
export const getGoals = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await query(
      `SELECT id, name, subtitle, description, tags, priority, category, type, target_amount, current_amount, meta_month, current_month, difference, deadline, color, is_completed, created_at, updated_at
       FROM goals WHERE user_id = $1 ORDER BY deadline ASC, created_at DESC`,
      [userId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Erro ao buscar metas:", error);
    res
      .status(500)
      .json({ success: false, message: "Erro interno do servidor" });
  }
};

// Buscar meta por ID
export const getGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const result = await query(
      `SELECT id, name, subtitle, description, tags, priority, category, type, target_amount, current_amount, meta_month, current_month, difference, deadline, color, is_completed, created_at, updated_at
       FROM goals WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Meta não encontrada" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Erro ao buscar meta:", error);
    res
      .status(500)
      .json({ success: false, message: "Erro interno do servidor" });
  }
};

// Criar nova meta
export const createGoal = async (req, res) => {
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
      name,
      subtitle,
      description,
      tags,
      priority,
      category,
      type,
      target_amount,
      current_amount,
      meta_month,
      current_month,
      difference,
      deadline,
      color,
    } = req.body;
    if (!META_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Categoria de meta inválida.",
      });
    }
    const result = await query(
      `INSERT INTO goals (user_id, name, subtitle, description, tags, priority, category, type, target_amount, current_amount, meta_month, current_month, difference, deadline, color)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING id, name, subtitle, description, tags, priority, category, type, target_amount, current_amount, meta_month, current_month, difference, deadline, color, is_completed, created_at, updated_at`,
      [
        userId,
        name,
        subtitle,
        description,
        tags,
        priority,
        category,
        type,
        target_amount,
        current_amount || 0,
        meta_month,
        current_month,
        difference,
        deadline,
        color || "#8B5CF6",
      ]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Erro ao criar meta:", error);
    res
      .status(500)
      .json({ success: false, message: "Erro interno do servidor" });
  }
};

// Atualizar meta
export const updateGoal = async (req, res) => {
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
      name,
      subtitle,
      description,
      tags,
      priority,
      category,
      type,
      target_amount,
      current_amount,
      meta_month,
      current_month,
      difference,
      deadline,
      color,
      is_completed,
    } = req.body;
    if (!META_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Categoria de meta inválida.",
      });
    }
    const result = await query(
      `UPDATE goals SET name = $1, subtitle = $2, description = $3, tags = $4, priority = $5, category = $6, type = $7, target_amount = $8, current_amount = $9, meta_month = $10, current_month = $11, difference = $12, deadline = $13, color = $14, is_completed = $15, updated_at = NOW()
       WHERE id = $16 AND user_id = $17
       RETURNING id, name, subtitle, description, tags, priority, category, type, target_amount, current_amount, meta_month, current_month, difference, deadline, color, is_completed, created_at, updated_at`,
      [
        name,
        subtitle,
        description,
        tags,
        priority,
        category,
        type,
        target_amount,
        current_amount,
        meta_month,
        current_month,
        difference,
        deadline,
        color,
        is_completed,
        id,
        userId,
      ]
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Meta não encontrada" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Erro ao atualizar meta:", error);
    res
      .status(500)
      .json({ success: false, message: "Erro interno do servidor" });
  }
};

// Excluir meta
export const deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const result = await query(
      `DELETE FROM goals WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, userId]
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Meta não encontrada" });
    }
    res.json({ success: true, message: "Meta excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir meta:", error);
    res
      .status(500)
      .json({ success: false, message: "Erro interno do servidor" });
  }
};
