import express from "express";
import { body } from "express-validator";
import {
  register,
  login,
  verifyToken,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
} from "../controllers/authController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Validações
const registerValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Nome deve ter entre 2 e 100 caracteres"),
  body("email").isEmail().normalizeEmail().withMessage("Email inválido"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Senha deve ter pelo menos 6 caracteres"),
];

const loginValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Email inválido"),
  body("password").notEmpty().withMessage("Senha é obrigatória"),
];

const forgotPasswordValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Email inválido"),
];

const resetPasswordValidation = [
  body("token").notEmpty().withMessage("Token é obrigatório"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("Nova senha deve ter pelo menos 6 caracteres"),
];

// Rotas públicas
router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.post("/forgot-password", forgotPasswordValidation, forgotPassword);
router.post("/reset-password", resetPasswordValidation, resetPassword);
router.get("/verify-email/:token", verifyEmail);

// Rotas protegidas
router.get("/verify", authenticateToken, verifyToken);
router.post("/logout", authenticateToken, logout);

export default router;
