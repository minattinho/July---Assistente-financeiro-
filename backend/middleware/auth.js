import jwt from "jsonwebtoken";
import { query } from "../config/database.js";

// Middleware para verificar token JWT
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const tokenFromHeader = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN
    const tokenFromCookie = req.cookies?.token;
    const token = tokenFromCookie || tokenFromHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token de acesso não fornecido",
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar usuário no banco
    const result = await query(
      "SELECT id, name, email, avatar_url, is_active FROM users WHERE id = $1",
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Usuário não encontrado",
      });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: "Conta desativada",
      });
    }

    // Adicionar usuário ao request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token inválido",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expirado",
      });
    }

    console.error("Erro na autenticação:", error);
    return res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

// Middleware opcional para rotas que podem ou não ter autenticação
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const result = await query(
        "SELECT id, name, email, avatar_url, is_active FROM users WHERE id = $1",
        [decoded.userId]
      );

      if (result.rows.length > 0 && result.rows[0].is_active) {
        req.user = result.rows[0];
      }
    }

    next();
  } catch (error) {
    // Se houver erro no token, apenas continua sem usuário autenticado
    next();
  }
};

// Middleware para verificar se o usuário é dono do recurso
export const checkOwnership = (resourceType) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id;
      const userId = req.user.id;

      let queryText;
      let params;

      switch (resourceType) {
        case "transaction":
          queryText =
            "SELECT id FROM transactions WHERE id = $1 AND user_id = $2";
          params = [resourceId, userId];
          break;
        case "category":
          queryText =
            "SELECT id FROM categories WHERE id = $1 AND user_id = $2";
          params = [resourceId, userId];
          break;
        case "account":
          queryText = "SELECT id FROM accounts WHERE id = $1 AND user_id = $2";
          params = [resourceId, userId];
          break;
        case "goal":
          queryText = "SELECT id FROM goals WHERE id = $1 AND user_id = $2";
          params = [resourceId, userId];
          break;
        case "budget":
          queryText = "SELECT id FROM budgets WHERE id = $1 AND user_id = $2";
          params = [resourceId, userId];
          break;
        default:
          return res.status(400).json({
            success: false,
            message: "Tipo de recurso inválido",
          });
      }

      const result = await query(queryText, params);

      if (result.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message:
            "Acesso negado: você não tem permissão para acessar este recurso",
        });
      }

      next();
    } catch (error) {
      console.error("Erro ao verificar propriedade:", error);
      return res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
    }
  };
};
