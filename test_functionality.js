#!/usr/bin/env node

/**
 * Script de Teste - July Finance
 *
 * Este script testa se todas as funcionalidades estão funcionando corretamente
 * após a remoção dos dados mockados.
 */

const API_BASE_URL = "http://localhost:3001/api";

// Função para fazer requisições HTTP
async function makeRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    return {
      status: response.status,
      ok: response.ok,
      data,
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message,
    };
  }
}

// Testes
async function runTests() {
  console.log("🧪 Iniciando testes de funcionalidade...\n");

  // Teste 1: Health Check
  console.log("1️⃣ Testando Health Check...");
  const healthCheck = await makeRequest("/health");
  if (healthCheck.ok) {
    console.log("✅ Health Check: OK");
  } else {
    console.log("❌ Health Check: FALHOU");
    console.log("   Erro:", healthCheck.error || healthCheck.data);
  }

  // Teste 2: Registro de usuário
  console.log("\n2️⃣ Testando Registro...");
  const registerData = {
    name: "Usuário Teste Funcional",
    email: "teste.funcional@july.com",
    password: "123456",
  };

  const register = await makeRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(registerData),
  });

  if (register.ok) {
    console.log("✅ Registro: OK");
    console.log("   Usuário criado:", register.data.data.user.name);
  } else {
    console.log("❌ Registro: FALHOU");
    console.log("   Erro:", register.data.message);
  }

  // Teste 3: Login
  console.log("\n3️⃣ Testando Login...");
  const loginData = {
    email: "teste.funcional@july.com",
    password: "123456",
  };

  const login = await makeRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(loginData),
  });

  let token = null;
  if (login.ok) {
    console.log("✅ Login: OK");
    token = login.data.data.token;
    console.log("   Token recebido:", token ? "SIM" : "NÃO");
  } else {
    console.log("❌ Login: FALHOU");
    console.log("   Erro:", login.data.message);
  }

  // Teste 4: Verificação de Token
  if (token) {
    console.log("\n4️⃣ Testando Verificação de Token...");
    const verify = await makeRequest("/auth/verify", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (verify.ok) {
      console.log("✅ Verificação de Token: OK");
      console.log("   Usuário autenticado:", verify.data.data.user.name);
    } else {
      console.log("❌ Verificação de Token: FALHOU");
      console.log("   Erro:", verify.data.message);
    }
  }

  // Teste 5: Buscar Transações (com autenticação)
  if (token) {
    console.log("\n5️⃣ Testando Busca de Transações...");
    const transactions = await makeRequest("/transactions", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (transactions.ok) {
      console.log("✅ Busca de Transações: OK");
      console.log(
        "   Total de transações:",
        transactions.data.data.transactions.length
      );
    } else {
      console.log("❌ Busca de Transações: FALHOU");
      console.log("   Erro:", transactions.data.message);
    }
  }

  // Teste 6: Buscar Categorias
  if (token) {
    console.log("\n6️⃣ Testando Busca de Categorias...");
    const categories = await makeRequest("/categories", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (categories.ok) {
      console.log("✅ Busca de Categorias: OK");
      console.log("   Total de categorias:", categories.data.data.length);
    } else {
      console.log("❌ Busca de Categorias: FALHOU");
      console.log("   Erro:", categories.data.message);
    }
  }

  // Teste 7: Buscar Contas
  if (token) {
    console.log("\n7️⃣ Testando Busca de Contas...");
    const accounts = await makeRequest("/accounts", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (accounts.ok) {
      console.log("✅ Busca de Contas: OK");
      console.log("   Total de contas:", accounts.data.data.length);
    } else {
      console.log("❌ Busca de Contas: FALHOU");
      console.log("   Erro:", accounts.data.message);
    }
  }

  // Teste 8: Criar Transação
  if (token) {
    console.log("\n8️⃣ Testando Criação de Transação...");
    const transactionData = {
      description: "Teste de Funcionalidade",
      amount: 100.5,
      type: "expense",
      date: new Date().toISOString().split("T")[0],
      category_id: 1,
      account_id: 1,
      notes: "Transação criada pelo script de teste",
    };

    const createTransaction = await makeRequest("/transactions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(transactionData),
    });

    if (createTransaction.ok) {
      console.log("✅ Criação de Transação: OK");
      console.log(
        "   Transação criada:",
        createTransaction.data.data.description
      );
    } else {
      console.log("❌ Criação de Transação: FALHOU");
      console.log("   Erro:", createTransaction.data.message);
    }
  }

  // Teste 9: Logout
  if (token) {
    console.log("\n9️⃣ Testando Logout...");
    const logout = await makeRequest("/auth/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (logout.ok) {
      console.log("✅ Logout: OK");
    } else {
      console.log("❌ Logout: FALHOU");
      console.log("   Erro:", logout.data.message);
    }
  }

  console.log("\n🎉 Testes concluídos!");
  console.log("\n📋 Resumo:");
  console.log(
    "   - Se todos os testes passaram, a aplicação está funcionando corretamente"
  );
  console.log(
    "   - Se algum teste falhou, verifique o backend e as configurações"
  );
  console.log("\n🚀 Para testar o frontend:");
  console.log("   1. Execute: npm run dev");
  console.log("   2. Acesse: http://localhost:5173");
  console.log("   3. Use as credenciais: teste.funcional@july.com / 123456");
}

// Executar testes
runTests().catch(console.error);
