import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

// Configuração do pool de conexões PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "july_finance",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD,
  max: 20, // máximo de conexões no pool
  idleTimeoutMillis: 30000, // tempo limite de inatividade
  connectionTimeoutMillis: 2000, // tempo limite de conexão
});

// Testar conexão
pool.on("connect", () => {
  console.log("✅ Conectado ao PostgreSQL");
});

pool.on("error", (err) => {
  console.error("❌ Erro na conexão PostgreSQL:", err);
});

// Função para executar queries
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(
      `📊 Query executada em ${duration}ms:`,
      text.substring(0, 50) + "..."
    );
    return res;
  } catch (error) {
    console.error("❌ Erro na query:", error);
    throw error;
  }
};

// Função para obter uma conexão do pool
export const getClient = () => {
  return pool.connect();
};

// Função para fechar o pool (usar apenas no final da aplicação)
export const closePool = () => {
  return pool.end();
};

export default pool;
