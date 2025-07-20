import express from "express";
import { body } from "express-validator";
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { authenticateToken, checkOwnership } from "../middleware/auth.js";

const router = express.Router();

// Validações
const categoryValidation = [
  body("name")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Nome deve ter entre 1 e 100 caracteres"),
  body("color")
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage("Cor deve estar no formato hexadecimal (#RRGGBB)"),
  body("icon")
    .optional()
    .isLength({ max: 10 })
    .withMessage("Ícone deve ter no máximo 10 caracteres"),
  body("type")
    .isIn(["income", "expense"])
    .withMessage('Tipo deve ser "income" ou "expense"'),
];

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Rotas
router.get("/", getCategories);
router.get("/:id", checkOwnership("category"), getCategory);
router.post("/", categoryValidation, createCategory);
router.put(
  "/:id",
  checkOwnership("category"),
  categoryValidation,
  updateCategory
);
router.delete("/:id", checkOwnership("category"), deleteCategory);

export default router;
