// Configuração base da API
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// Função para fazer requisições HTTP
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  // Adicionar headers padrão
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // NÃO usar localStorage para token
  // Sempre enviar cookies
  const config = {
    ...options,
    headers,
    credentials: "include", // ESSENCIAL para cookies HTTP Only
  };

  try {
    const response = await fetch(url, config);

    // Se a resposta não for ok, lançar erro
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Erro ${response.status}: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Erro na requisição API:", error);
    throw error;
  }
}

// Serviços de autenticação
export const authService = {
  // Login
  async login(credentials) {
    return apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  // Registro
  async register(userData) {
    return apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  // Verificar token
  async verify() {
    return apiRequest("/auth/verify");
  },

  // Logout
  async logout() {
    return apiRequest("/auth/logout", {
      method: "POST",
    });
  },

  // Esqueci a senha
  async forgotPassword(email) {
    return apiRequest("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  // Resetar senha
  async resetPassword(token, newPassword) {
    return apiRequest("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    });
  },
};

// Serviços de transações
export const transactionService = {
  // Buscar todas as transações
  async getTransactions(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return apiRequest(`/transactions?${queryParams}`);
  },

  // Buscar transação por ID
  async getTransaction(id) {
    return apiRequest(`/transactions/${id}`);
  },

  // Criar nova transação
  async createTransaction(transactionData) {
    return apiRequest("/transactions", {
      method: "POST",
      body: JSON.stringify(transactionData),
    });
  },

  // Atualizar transação
  async updateTransaction(id, transactionData) {
    return apiRequest(`/transactions/${id}`, {
      method: "PUT",
      body: JSON.stringify(transactionData),
    });
  },

  // Deletar transação
  async deleteTransaction(id) {
    return apiRequest(`/transactions/${id}`, {
      method: "DELETE",
    });
  },
};

// Serviços de categorias
export const categoryService = {
  // Buscar todas as categorias
  async getCategories() {
    return apiRequest("/categories");
  },

  // Criar nova categoria
  async createCategory(categoryData) {
    return apiRequest("/categories", {
      method: "POST",
      body: JSON.stringify(categoryData),
    });
  },

  // Atualizar categoria
  async updateCategory(id, categoryData) {
    return apiRequest(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(categoryData),
    });
  },

  // Deletar categoria
  async deleteCategory(id) {
    return apiRequest(`/categories/${id}`, {
      method: "DELETE",
    });
  },
};

// Serviços de contas bancárias
export const accountService = {
  // Buscar todas as contas
  async getAccounts() {
    return apiRequest("/accounts");
  },

  // Criar nova conta
  async createAccount(accountData) {
    return apiRequest("/accounts", {
      method: "POST",
      body: JSON.stringify(accountData),
    });
  },

  // Atualizar conta
  async updateAccount(id, accountData) {
    return apiRequest(`/accounts/${id}`, {
      method: "PUT",
      body: JSON.stringify(accountData),
    });
  },

  // Deletar conta
  async deleteAccount(id) {
    return apiRequest(`/accounts/${id}`, {
      method: "DELETE",
    });
  },
};

// Serviços de relatórios
export const reportService = {
  // Relatório de saldo
  async getBalanceReport(period = "month") {
    return apiRequest(`/reports/balance?period=${period}`);
  },

  // Relatório de gastos por categoria
  async getCategoryReport(period = "month") {
    return apiRequest(`/reports/categories?period=${period}`);
  },

  // Relatório de fluxo de caixa
  async getCashFlowReport(period = "month") {
    return apiRequest(`/reports/cash-flow?period=${period}`);
  },
};

// Serviços de usuário
export const userService = {
  // Buscar perfil do usuário
  async getProfile() {
    return apiRequest("/user/profile");
  },

  // Atualizar perfil
  async updateProfile(profileData) {
    return apiRequest("/user/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  },

  // Alterar senha
  async changePassword(passwordData) {
    return apiRequest("/user/change-password", {
      method: "POST",
      body: JSON.stringify(passwordData),
    });
  },

  // Atualizar plano
  async updatePlan(planData) {
    return apiRequest("/user/plan", {
      method: "PUT",
      body: JSON.stringify(planData),
    });
  },
};

// Serviços de metas financeiras
export const goalService = {
  // Buscar todas as metas
  async getGoals() {
    return apiRequest("/goals");
  },

  // Buscar meta por ID
  async getGoal(id) {
    return apiRequest(`/goals/${id}`);
  },

  // Criar nova meta
  async createGoal(goalData) {
    return apiRequest("/goals", {
      method: "POST",
      body: JSON.stringify(goalData),
    });
  },

  // Atualizar meta
  async updateGoal(id, goalData) {
    return apiRequest(`/goals/${id}`, {
      method: "PUT",
      body: JSON.stringify(goalData),
    });
  },

  // Deletar meta
  async deleteGoal(id) {
    return apiRequest(`/goals/${id}`, {
      method: "DELETE",
    });
  },
};

export default {
  authService,
  transactionService,
  categoryService,
  accountService,
  reportService,
  userService,
  goalService,
};
