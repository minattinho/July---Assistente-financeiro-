import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import { useTransactions } from "../hooks/useTransactions";
import LoadingSpinner from "./LoadingSpinner";

const TABS = [
  { label: "Despesas", value: "despesas" },
  { label: "Receitas", value: "receitas" },
  { label: "Evolução", value: "evolucao" },
  { label: "Metas", value: "metas" },
];

export default function Reports() {
  const [activeTab, setActiveTab] = useState("despesas");
  const { transactions, loading, error, summary } = useTransactions();

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Calcular estatísticas por categoria
  const getCategoryStats = () => {
    const categoryMap = {};

    transactions.forEach((transaction) => {
      const categoryName = transaction.category_name || "Sem categoria";
      if (!categoryMap[categoryName]) {
        categoryMap[categoryName] = {
          total: 0,
          count: 0,
          type: transaction.type,
        };
      }
      categoryMap[categoryName].total += parseFloat(transaction.amount);
      categoryMap[categoryName].count += 1;
    });

    return Object.entries(categoryMap)
      .map(([name, data]) => ({
        name,
        total: data.total,
        count: data.count,
        type: data.type,
        percentage:
          (data.total / (summary.monthlyIncome + summary.monthlyExpenses)) *
          100,
      }))
      .sort((a, b) => b.total - a.total);
  };

  const categoryStats = getCategoryStats();

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-2">Relatórios</h1>
        <p className="text-gray-500 mb-6">
          Análise detalhada das suas finanças
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            Erro ao carregar dados: {error}
          </div>
        )}
        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 flex flex-col items-start">
            <span className="text-gray-500 text-sm">Receita Total</span>
            <span className="text-green-600 text-2xl font-bold">
              {loading ? (
                <LoadingSpinner size="sm" text="" />
              ) : (
                formatCurrency(summary.monthlyIncome)
              )}
            </span>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex flex-col items-start">
            <span className="text-gray-500 text-sm">Despesa Total</span>
            <span className="text-red-500 text-2xl font-bold">
              {loading ? (
                <LoadingSpinner size="sm" text="" />
              ) : (
                formatCurrency(summary.monthlyExpenses)
              )}
            </span>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex flex-col items-start">
            <span className="text-gray-500 text-sm">Saldo Líquido</span>
            <span className="text-blue-600 text-2xl font-bold">
              {loading ? (
                <LoadingSpinner size="sm" text="" />
              ) : (
                formatCurrency(summary.monthlyIncome - summary.monthlyExpenses)
              )}
            </span>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex flex-col items-start">
            <span className="text-gray-500 text-sm">Transações</span>
            <span className="text-purple-500 text-2xl font-bold">
              {loading ? (
                <LoadingSpinner size="sm" text="" />
              ) : (
                transactions.length
              )}
            </span>
          </div>
        </div>
        {/* Tabs funcionais */}
        <div className="flex mb-6">
          {TABS.map((tab, idx) => (
            <button
              key={tab.value}
              className={`px-4 py-2 border border-gray-200 focus:outline-none transition-colors ${
                activeTab === tab.value
                  ? "bg-green-500 text-white" + (idx === 0 ? " rounded-l" : "")
                  : "bg-white text-gray-700" +
                    (idx === TABS.length - 1 ? " rounded-r" : "")
              }`}
              onClick={() => setActiveTab(tab.value)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
        {/* Conteúdo das tabs */}
        {activeTab === "despesas" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Despesas por Categoria */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-xl font-semibold mb-2">
                Despesas por Categoria
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                Distribuição dos gastos por categoria
              </p>
              {loading ? (
                <div className="h-40 flex items-center justify-center">
                  <LoadingSpinner text="Carregando..." />
                </div>
              ) : categoryStats.filter((cat) => cat.type === "expense").length >
                0 ? (
                <div className="space-y-3">
                  {categoryStats
                    .filter((cat) => cat.type === "expense")
                    .slice(0, 5)
                    .map((category, index) => (
                      <div
                        key={category.name}
                        className="flex items-center gap-3"
                      >
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{
                            backgroundColor: `hsl(${index * 60}, 70%, 50%)`,
                          }}
                        ></div>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{category.name}</span>
                            <span className="text-gray-600">
                              {formatCurrency(category.total)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${Math.min(category.percentage, 100)}%`,
                                backgroundColor: `hsl(${index * 60}, 70%, 50%)`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center text-gray-400">
                  Nenhuma despesa encontrada
                </div>
              )}
            </div>
            {/* Análise de Tendências */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-xl font-semibold mb-2">
                Análise de Tendências
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                Variação das despesas por categoria
              </p>
              {loading ? (
                <div className="h-40 flex items-center justify-center">
                  <LoadingSpinner text="Carregando..." />
                </div>
              ) : categoryStats.filter((cat) => cat.type === "expense").length >
                0 ? (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    <p>
                      • Maior gasto:{" "}
                      <strong>
                        {
                          categoryStats.filter(
                            (cat) => cat.type === "expense"
                          )[0]?.name
                        }
                      </strong>
                    </p>
                    <p>
                      • Total de categorias:{" "}
                      <strong>
                        {
                          categoryStats.filter((cat) => cat.type === "expense")
                            .length
                        }
                      </strong>
                    </p>
                    <p>
                      • Média por categoria:{" "}
                      <strong>
                        {formatCurrency(
                          categoryStats
                            .filter((cat) => cat.type === "expense")
                            .reduce((acc, cat) => acc + cat.total, 0) /
                            categoryStats.filter(
                              (cat) => cat.type === "expense"
                            ).length
                        )}
                      </strong>
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      💡 <strong>Dica:</strong> Considere revisar seus gastos em{" "}
                      {
                        categoryStats.filter((cat) => cat.type === "expense")[0]
                          ?.name
                      }{" "}
                      para economizar mais.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center text-gray-400">
                  Nenhuma despesa para analisar
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === "receitas" && (
          <div className="bg-white rounded-lg shadow p-4 mt-4">
            <h2 className="text-xl font-semibold mb-2">
              Receitas por Categoria
            </h2>
            <p className="text-gray-500 text-sm mb-4">
              Distribuição das receitas por categoria
            </p>
            {loading ? (
              <div className="h-40 flex items-center justify-center">
                <LoadingSpinner text="Carregando..." />
              </div>
            ) : categoryStats.filter((cat) => cat.type === "income").length >
              0 ? (
              <div className="space-y-3">
                {categoryStats
                  .filter((cat) => cat.type === "income")
                  .slice(0, 5)
                  .map((category, index) => (
                    <div
                      key={category.name}
                      className="flex items-center gap-3"
                    >
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{
                          backgroundColor: `hsl(${120 + index * 60}, 70%, 50%)`,
                        }}
                      ></div>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{category.name}</span>
                          <span className="text-gray-600">
                            {formatCurrency(category.total)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${Math.min(category.percentage, 100)}%`,
                              backgroundColor: `hsl(${
                                120 + index * 60
                              }, 70%, 50%)`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-gray-400">
                Nenhuma receita encontrada
              </div>
            )}
          </div>
        )}
        {activeTab === "evolucao" && (
          <div className="bg-white rounded-lg shadow p-4 mt-4">
            <h2 className="text-xl font-semibold mb-2">Evolução Financeira</h2>
            <p className="text-gray-500 text-sm mb-4">
              Acompanhe a evolução das suas finanças ao longo do tempo
            </p>
            {loading ? (
              <div className="h-40 flex items-center justify-center">
                <LoadingSpinner text="Carregando..." />
              </div>
            ) : transactions.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(summary.monthlyIncome)}
                    </div>
                    <div className="text-sm text-gray-600">Receitas do Mês</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {formatCurrency(summary.monthlyExpenses)}
                    </div>
                    <div className="text-sm text-gray-600">Despesas do Mês</div>
                  </div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(summary.totalBalance)}
                  </div>
                  <div className="text-sm text-gray-600">Saldo Total</div>
                </div>
                <div className="text-sm text-gray-600">
                  <p>
                    • Total de transações:{" "}
                    <strong>{transactions.length}</strong>
                  </p>
                  <p>
                    • Média por transação:{" "}
                    <strong>
                      {formatCurrency(
                        transactions.reduce(
                          (acc, t) => acc + parseFloat(t.amount),
                          0
                        ) / transactions.length
                      )}
                    </strong>
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-gray-400">
                Nenhuma transação para analisar
              </div>
            )}
          </div>
        )}
        {activeTab === "metas" && (
          <div className="bg-white rounded-lg shadow p-4 mt-4">
            <h2 className="text-xl font-semibold mb-2">Metas</h2>
            <p className="text-gray-500 text-sm mb-4">
              Acompanhe o progresso das suas metas financeiras
            </p>
            {loading ? (
              <div className="h-40 flex items-center justify-center">
                <LoadingSpinner text="Carregando..." />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 mb-2">
                    Funcionalidade em Desenvolvimento
                  </div>
                  <div className="text-sm text-gray-600">
                    Em breve você poderá criar e acompanhar suas metas
                    financeiras!
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="text-lg font-semibold mb-2">
                      💡 Dicas para Metas
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Defina metas realistas</li>
                      <li>• Acompanhe o progresso</li>
                      <li>• Celebre pequenas conquistas</li>
                    </ul>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="text-lg font-semibold mb-2">
                      📊 Estatísticas Atuais
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <li>
                        • Saldo atual: {formatCurrency(summary.totalBalance)}
                      </li>
                      <li>
                        • Receitas do mês:{" "}
                        {formatCurrency(summary.monthlyIncome)}
                      </li>
                      <li>
                        • Despesas do mês:{" "}
                        {formatCurrency(summary.monthlyExpenses)}
                      </li>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
