import { useState, useEffect, useCallback } from "react";
import { transactionService } from "../services/api.js";

export const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    categoryBreakdown: [],
  });

  // Buscar transações
  const fetchTransactions = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await transactionService.getTransactions(filters);
      setTransactions(response.data.transactions);
      console.log("Transações carregadas:", response.data.transactions);

      // Calcular resumo
      calculateSummary(response.data.transactions);
    } catch (err) {
      setError(err.message);
      console.error("Erro ao buscar transações:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Calcular resumo das transações
  const calculateSummary = useCallback((transactions) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filtrar transações do mês atual
    const monthlyTransactions = transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return (
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear
      );
    });

    let totalBalance = 0;
    let monthlyIncome = 0;
    let monthlyExpenses = 0;
    const categoryMap = new Map();
    let previousMonthBalance = 0;
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousMonthYear =
      currentMonth === 0 ? currentYear - 1 : currentYear;

    monthlyTransactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.date);
      const isCurrentMonth =
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear;
      const isPreviousMonth =
        transactionDate.getMonth() === previousMonth &&
        transactionDate.getFullYear() === previousMonthYear;

      const amount = Number(transaction.amount); // Garantir que é número

      if (transaction.type === "income") {
        totalBalance += amount;
        if (isCurrentMonth) {
          monthlyIncome += amount;
        }
        if (isPreviousMonth) {
          previousMonthBalance += amount;
        }
      } else {
        totalBalance -= amount;
        if (isCurrentMonth) {
          monthlyExpenses += amount;
        }
        if (isPreviousMonth) {
          previousMonthBalance -= amount;
        }
      }

      // Agrupar por categoria
      if (transaction.type === "expense" && isCurrentMonth) {
        const categoryName = transaction.category_name || "Sem categoria";
        const currentValue = categoryMap.get(categoryName) || 0;
        categoryMap.set(categoryName, currentValue + amount);
      }
    });

    // Converter para array e calcular percentuais
    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([name, value]) => ({
        name,
        value,
        percent:
          monthlyExpenses > 0 ? Math.round((value / monthlyExpenses) * 100) : 0,
      }))
      .sort((a, b) => b.value - a.value);

    setSummary({
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      categoryBreakdown,
      previousMonthBalance,
    });
  }, []);

  // Criar transação
  const createTransaction = useCallback(
    async (transactionData) => {
      setLoading(true);
      setError(null);

      try {
        const response = await transactionService.createTransaction(
          transactionData
        );
        // Se for parcelado, response.data é array
        if (Array.isArray(response.data)) {
          setTransactions((prev) => [...response.data, ...prev]);
          calculateSummary([...response.data, ...transactions]);
          return response.data;
        } else {
          setTransactions((prev) => [response.data, ...prev]);
          calculateSummary([response.data, ...transactions]);
          return response.data;
        }
      } catch (err) {
        setError(err.message);
        console.error("Erro ao criar transação:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [transactions, calculateSummary]
  );

  // Atualizar transação
  const updateTransaction = useCallback(
    async (id, transactionData) => {
      setLoading(true);
      setError(null);

      try {
        const response = await transactionService.updateTransaction(
          id,
          transactionData
        );
        setTransactions((prev) =>
          prev.map((transaction) =>
            transaction.id === id ? response.data : transaction
          )
        );
        calculateSummary(
          transactions.map((t) => (t.id === id ? response.data : t))
        );
        return response.data;
      } catch (err) {
        setError(err.message);
        console.error("Erro ao atualizar transação:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [transactions, calculateSummary]
  );

  // Deletar transação
  const deleteTransaction = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);

      try {
        await transactionService.deleteTransaction(id);
        setTransactions((prev) =>
          prev.filter((transaction) => transaction.id !== id)
        );
        calculateSummary(transactions.filter((t) => t.id !== id));
      } catch (err) {
        setError(err.message);
        console.error("Erro ao deletar transação:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [transactions, calculateSummary]
  );

  // Buscar transações ao montar o componente
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    loading,
    error,
    summary,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
};
