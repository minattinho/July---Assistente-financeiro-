import express from "express";
import { body } from "express-validator";
import {
  getAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
} from "../controllers/accountController.js";
import { authenticateToken, checkOwnership } from "../middleware/auth.js";

const router = express.Router();

// Validações
const accountValidation = [
  body("name")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Nome deve ter entre 1 e 100 caracteres"),
  body("type")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Tipo deve ter entre 1 e 50 caracteres"),
  body("balance").isFloat().withMessage("Saldo deve ser um número válido"),
  body("color")
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage("Cor deve estar no formato hexadecimal (#RRGGBB)"),
  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Descrição deve ter no máximo 500 caracteres"),
];

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Rotas
router.get("/", getAccounts);
router.get("/:id", checkOwnership("account"), getAccount);
router.post("/", accountValidation, createAccount);
router.put("/:id", checkOwnership("account"), accountValidation, updateAccount);
router.delete("/:id", checkOwnership("account"), deleteAccount);

export default router;
