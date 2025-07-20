import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { query } from "../config/database.js";
import { validationResult } from "express-validator";

// Gerar token JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// Registrar novo usuário
export const register = async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Dados inválidos",
        errors: errors.array(),
      });
    }

    const { name, email, password } = req.body;

    // Verificar se o email já existe
    const existingUser = await query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email já está em uso",
      });
    }

    // Criptografar senha
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Gerar token de verificação
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Inserir usuário
    const result = await query(
      `
      INSERT INTO users (name, email, password, verification_token)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, avatar_url, email_verified
    `,
      [name, email, hashedPassword, verificationToken]
    );

    const user = result.rows[0];

    // Criar conta principal automaticamente
    await query(
      `
      INSERT INTO accounts (user_id, name, type, balance, color)
      VALUES ($1, $2, $3, $4, $5)
    `,
      [user.id, "Conta Principal", "Conta Corrente", 0.0, "#10B981"]
    );

    // Criar categorias padrão automaticamente
    const defaultCategories = [
      // Categorias de despesas
      { name: "Alimentação", color: "#EF4444", icon: "🍽️", type: "expense" },
      { name: "Transporte", color: "#F59E0B", icon: "🚗", type: "expense" },
      { name: "Moradia", color: "#10B981", icon: "🏠", type: "expense" },
      { name: "Saúde", color: "#3B82F6", icon: "🏥", type: "expense" },
      { name: "Educação", color: "#8B5CF6", icon: "📚", type: "expense" },
      { name: "Lazer", color: "#EC4899", icon: "🎮", type: "expense" },
      { name: "Vestuário", color: "#06B6D4", icon: "👕", type: "expense" },
      { name: "Outros", color: "#6B7280", icon: "📦", type: "expense" },
      // Categorias de receitas
      { name: "Salário", color: "#10B981", icon: "💰", type: "income" },
      { name: "Freelance", color: "#3B82F6", icon: "💼", type: "income" },
      { name: "Investimentos", color: "#8B5CF6", icon: "📈", type: "income" },
      { name: "Presentes", color: "#F59E0B", icon: "🎁", type: "income" },
      { name: "Outros", color: "#6B7280", icon: "📦", type: "income" },
    ];

    for (const category of defaultCategories) {
      await query(
        `
        INSERT INTO categories (user_id, name, color, icon, type, is_default)
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
        [
          user.id,
          category.name,
          category.color,
          category.icon,
          category.type,
          true,
        ]
      );
    }

    // Gerar token JWT
    const token = generateToken(user.id);

    // TODO: Enviar email de verificação
    // await sendVerificationEmail(user.email, verificationToken);

    // Enviar token como cookie HTTP Only
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    });
    res.status(201).json({
      success: true,
      message:
        "Usuário registrado com sucesso. Uma conta principal e categorias padrão foram criadas automaticamente.",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar_url: user.avatar_url,
          email_verified: user.email_verified,
        },
        token: token,
      },
    });
  } catch (error) {
    console.error("Erro no registro:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

// Login do usuário
export const login = async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Dados inválidos",
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Buscar usuário
    const result = await query(
      "SELECT id, name, email, password, avatar_url, is_active, email_verified FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Email ou senha incorretos",
      });
    }

    const user = result.rows[0];

    // Verificar se a conta está ativa
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: "Conta desativada",
      });
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Email ou senha incorretos",
      });
    }

    // Gerar token JWT
    const token = generateToken(user.id);

    // Enviar token como cookie HTTP Only
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    });
    res.json({
      success: true,
      message: "Login realizado com sucesso",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar_url: user.avatar_url,
          email_verified: user.email_verified,
        },
        token: token,
      },
    });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

// Verificar token
export const verifyToken = async (req, res) => {
  try {
    // O middleware de autenticação já verificou o token
    // e adicionou o usuário ao req.user
    res.json({
      success: true,
      message: "Token válido",
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    console.error("Erro na verificação do token:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

// Logout (opcional - pode ser feito apenas no frontend)
export const logout = async (req, res) => {
  try {
    // Limpar o cookie do token
    res.clearCookie("token");
    res.json({
      success: true,
      message: "Logout realizado com sucesso",
    });
  } catch (error) {
    console.error("Erro no logout:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

// Esqueci a senha
export const forgotPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Email inválido",
        errors: errors.array(),
      });
    }

    const { email } = req.body;

    // Buscar usuário
    const result = await query(
      "SELECT id, name FROM users WHERE email = $1 AND is_active = true",
      [email]
    );

    if (result.rows.length === 0) {
      // Por segurança, não revelar se o email existe ou não
      return res.json({
        success: true,
        message:
          "Se o email existir, você receberá um link para redefinir sua senha",
      });
    }

    const user = result.rows[0];

    // Gerar token de reset
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 3600000); // 1 hora

    // Salvar token no banco
    await query(
      `
      UPDATE users 
      SET reset_password_token = $1, reset_password_expires = $2
      WHERE id = $3
    `,
      [resetToken, resetExpires, user.id]
    );

    // TODO: Enviar email com link de reset
    // await sendResetPasswordEmail(email, resetToken);

    res.json({
      success: true,
      message:
        "Se o email existir, você receberá um link para redefinir sua senha",
    });
  } catch (error) {
    console.error("Erro no forgot password:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

// Resetar senha
export const resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Dados inválidos",
        errors: errors.array(),
      });
    }

    const { token, newPassword } = req.body;

    // Buscar usuário com token válido
    const result = await query(
      `
      SELECT id FROM users 
      WHERE reset_password_token = $1 
      AND reset_password_expires > NOW()
      AND is_active = true
    `,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Token inválido ou expirado",
      });
    }

    const user = result.rows[0];

    // Criptografar nova senha
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Atualizar senha e limpar token
    await query(
      `
      UPDATE users 
      SET password = $1, reset_password_token = NULL, reset_password_expires = NULL
      WHERE id = $2
    `,
      [hashedPassword, user.id]
    );

    res.json({
      success: true,
      message: "Senha redefinida com sucesso",
    });
  } catch (error) {
    console.error("Erro no reset password:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

// Verificar email
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Buscar usuário com token de verificação
    const result = await query(
      `
      SELECT id FROM users 
      WHERE verification_token = $1 
      AND email_verified = false
    `,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Token de verificação inválido",
      });
    }

    const user = result.rows[0];

    // Marcar email como verificado
    await query(
      `
      UPDATE users 
      SET email_verified = true, verification_token = NULL
      WHERE id = $1
    `,
      [user.id]
    );

    res.json({
      success: true,
      message: "Email verificado com sucesso",
    });
  } catch (error) {
    console.error("Erro na verificação do email:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};
