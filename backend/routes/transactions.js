import express from "express";
import { body } from "express-validator";
import {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "../controllers/transactionController.js";
import { authenticateToken, checkOwnership } from "../middleware/auth.js";

const router = express.Router();

// Validações
const transactionValidation = [
  body("description")
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("Descrição deve ter entre 1 e 255 caracteres"),
  body("amount")
    .isFloat({ min: 0.01 })
    .withMessage("Valor deve ser um número positivo"),
  body("type")
    .isIn(["income", "expense"])
    .withMessage('Tipo deve ser "income" ou "expense"'),
  body("date").isISO8601().withMessage("Data deve estar no formato ISO 8601"),
  body("account_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("ID da conta deve ser um número inteiro positivo"),
  body("category_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("ID da categoria deve ser um número inteiro positivo"),
  body("notes")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Notas devem ter no máximo 1000 caracteres"),
  body("is_recurring")
    .optional()
    .isBoolean()
    .withMessage("is_recurring deve ser um valor booleano"),
  body("recurring_frequency")
    .optional()
    .isIn(["daily", "weekly", "monthly", "yearly"])
    .withMessage("Frequência deve ser daily, weekly, monthly ou yearly"),
  body("recurring_end_date")
    .optional()
    .isISO8601()
    .withMessage("Data de fim deve estar no formato ISO 8601"),
  body("parcelas")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Parcelas deve ser um número inteiro positivo"),
];

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Rotas
router.get("/", getTransactions);
router.get("/:id", checkOwnership("transaction"), getTransaction);
router.post("/", transactionValidation, createTransaction);
router.put(
  "/:id",
  checkOwnership("transaction"),
  transactionValidation,
  updateTransaction
);
router.delete("/:id", checkOwnership("transaction"), deleteTransaction);

export default router;
