import express from "express";
import { body } from "express-validator";
import {
  getGoals,
  getGoal,
  createGoal,
  updateGoal,
  deleteGoal,
} from "../controllers/goalController.js";
import { authenticateToken, checkOwnership } from "../middleware/auth.js";

const router = express.Router();

// Listar todas as metas do usuário
router.get("/", authenticateToken, getGoals);

// Buscar meta por ID
router.get("/:id", authenticateToken, checkOwnership("goal"), getGoal);

// Criar nova meta
router.post(
  "/",
  authenticateToken,
  [
    body("name").notEmpty().withMessage("Nome é obrigatório"),
    body("target_amount")
      .isNumeric()
      .withMessage("Valor alvo deve ser numérico"),
    body("deadline").optional().isISO8601().withMessage("Data inválida"),
  ],
  createGoal
);

// Atualizar meta
router.put(
  "/:id",
  authenticateToken,
  checkOwnership("goal"),
  [
    body("name").notEmpty().withMessage("Nome é obrigatório"),
    body("target_amount")
      .isNumeric()
      .withMessage("Valor alvo deve ser numérico"),
    body("deadline").optional().isISO8601().withMessage("Data inválida"),
  ],
  updateGoal
);

// Excluir meta
router.delete("/:id", authenticateToken, checkOwnership("goal"), deleteGoal);

export default router;
