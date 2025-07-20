import express from "express";

const router = express.Router();

// Health check endpoint
router.get("/health", async (req, res) => {
  try {
    // Verificar conexão com banco de dados
    const { query } = await import("../config/database.js");
    await query("SELECT 1");

    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "1.0.0",
      database: "connected",
    });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(503).json({
      status: "ERROR",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "1.0.0",
      database: "disconnected",
      error: error.message,
    });
  }
});

export default router;
