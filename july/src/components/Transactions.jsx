import React, { useState, useEffect } from "react";
import { useTransactions } from "../hooks/useTransactions";
import { categoryService } from "../services/api.js";
import TransactionModal from "./TransactionModal";
import LoadingSpinner from "./LoadingSpinner";
import Notification from "./Notification";
import Layout from "./Layout";

const PERIOD_OPTIONS = [
  { label: "Este mês", value: "this_month" },
  { label: "Últimos 3 meses", value: "last_3_months" },
  { label: "Este ano", value: "this_year" },
  { label: "Todos", value: "all" },
];

const TYPE_OPTIONS = [
  { label: "Todos os tipos", value: "all" },
  { label: "Receitas", value: "income" },
  { label: "Despesas", value: "expense" },
];

export default function Transactions() {
  const {
    transactions,
    loading,
    error,
    summary,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions();

  // Filtros
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [category, setCategory] = useState("all");
  const [period, setPeriod] = useState("this_month");
  const [categories, setCategories] = useState([]);

  // Modal e notificações
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "info",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Buscar categorias ao montar
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await categoryService.getCategories();
        setCategories(res.data || []);
      } catch (e) {
        setCategories([]);
      }
    }
    loadCategories();
  }, []);

  // Buscar transações sempre que filtros mudarem
  useEffect(() => {
    const filters = {};
    if (type !== "all") filters.type = type;
    if (category !== "all") filters.category_id = category;
    // Período
    const now = new Date();
    if (period === "this_month") {
      filters.startDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      ).toISOString();
      filters.endDate = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59
      ).toISOString();
    } else if (period === "last_3_months") {
      filters.startDate = new Date(
        now.getFullYear(),
        now.getMonth() - 2,
        1
      ).toISOString();
      filters.endDate = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59
      ).toISOString();
    } else if (period === "this_year") {
      filters.startDate = new Date(now.getFullYear(), 0, 1).toISOString();
      filters.endDate = new Date(
        now.getFullYear(),
        11,
        31,
        23,
        59,
        59
      ).toISOString();
    }
    fetchTransactions(filters);
  }, [type, category, period, fetchTransactions]);

  // Busca por texto (frontend)
  const filteredTransactions = transactions.filter((t) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      t.description?.toLowerCase().includes(s) ||
      t.category_name?.toLowerCase().includes(s)
    );
  });

  // Paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Resetar página quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [search, type, category, period]);

  // Funções auxiliares e handlers
  const handleCreateTransaction = async (transactionData) => {
    setModalLoading(true);
    try {
      await createTransaction(transactionData);
      setModalOpen(false);
      setNotification({
        show: true,
        message: "Transação criada com sucesso!",
        type: "success",
      });
    } catch (error) {
      setNotification({
        show: true,
        message: error.message || "Erro ao criar transação",
        type: "error",
      });
    } finally {
      setModalLoading(false);
    }
  };

  const handleEditTransaction = async (transactionData) => {
    setModalLoading(true);
    try {
      await updateTransaction(editingTransaction.id, transactionData);
      setModalOpen(false);
      setEditingTransaction(null);
      setNotification({
        show: true,
        message: "Transação atualizada com sucesso!",
        type: "success",
      });
    } catch (error) {
      setNotification({
        show: true,
        message: error.message || "Erro ao atualizar transação",
        type: "error",
      });
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta transação?")) {
      try {
        await deleteTransaction(id);
        setNotification({
          show: true,
          message: "Transação excluída com sucesso!",
          type: "success",
        });
      } catch (error) {
        setNotification({
          show: true,
          message: error.message || "Erro ao excluir transação",
          type: "error",
        });
      }
    }
  };

  const openEditModal = (transaction) => {
    setEditingTransaction(transaction);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingTransaction(null);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Transações</h1>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar transações..."
          className="border rounded-lg px-4 py-2 w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border rounded-lg px-4 py-2"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          className="border rounded-lg px-4 py-2"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">Todas as categorias</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <select
          className="border rounded-lg px-4 py-2"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          {PERIOD_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow flex flex-col justify-between">
          <div className="text-gray-500 mb-2">Total de Receitas</div>
          <div className="text-3xl font-bold mb-2 text-green-600">
            {loading ? (
              <LoadingSpinner size="sm" text="" />
            ) : (
              formatCurrency(summary.monthlyIncome)
            )}
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow flex flex-col justify-between">
          <div className="text-gray-500 mb-2">Total de Despesas</div>
          <div className="text-3xl font-bold mb-2 text-red-500">
            {loading ? (
              <LoadingSpinner size="sm" text="" />
            ) : (
              formatCurrency(summary.monthlyExpenses)
            )}
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow flex flex-col justify-between">
          <div className="text-gray-500 mb-2">Saldo Líquido</div>
          <div className="text-3xl font-bold mb-2">
            {loading ? (
              <LoadingSpinner size="sm" text="" />
            ) : (
              formatCurrency(summary.monthlyIncome - summary.monthlyExpenses)
            )}
          </div>
        </div>
      </div>

      {/* Lista de transações */}
      <div className="bg-white rounded-xl p-6 shadow mb-8">
        <div className="font-bold text-lg mb-2">
          Transações ({filteredTransactions.length})
        </div>
        <div className="text-gray-400 text-sm mb-4">
          Lista completa das suas movimentações financeiras
        </div>
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            Erro ao carregar dados: {error}
          </div>
        )}
        {loading ? (
          <LoadingSpinner text="Carregando transações..." />
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhuma transação encontrada
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {currentTransactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                onEdit={() => openEditModal(transaction)}
                onDelete={() => handleDeleteTransaction(transaction.id)}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
        {/* Paginação funcional */}
        {transactions.length > 0 && (
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-500">
              Mostrando {filteredTransactions.length} de {transactions.length}{" "}
              transações
            </div>
            <div className="flex gap-2">
              <button
                className="px-4 py-2 border rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              >
                Anterior
              </button>
              <span className="px-4 py-2 text-gray-700">
                Página {currentPage}
              </span>
              <button
                className="px-4 py-2 border rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={filteredTransactions.length < itemsPerPage}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                Próximo
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Transação */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSubmit={
          editingTransaction ? handleEditTransaction : handleCreateTransaction
        }
        transaction={editingTransaction}
        loading={modalLoading}
      />

      {/* Notificação */}
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.show}
        onClose={() =>
          setNotification({ show: false, message: "", type: "info" })
        }
      />
    </Layout>
  );
}

function TransactionItem({
  transaction,
  onEdit,
  onDelete,
  formatCurrency,
  formatDate,
}) {
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg ${
        transaction.type === "income" ? "bg-green-50" : "bg-red-50"
      }`}
    >
      {/* Ícone da categoria */}
      <div className="flex items-center gap-3 flex-1">
        <span
          className={`flex items-center justify-center rounded-full h-10 w-10 text-xl select-none ${
            transaction.type === "income"
              ? "bg-green-100 text-green-600"
              : "bg-red-100 text-red-500"
          }`}
          style={{ minWidth: 40 }}
        >
          {transaction.category_icon || "💸"}
        </span>
        <div>
          <div className="font-semibold">{transaction.description}</div>
          <div className="text-xs text-gray-400">
            {transaction.category_name || "Sem categoria"}
          </div>
        </div>
      </div>
      <div className="text-right flex items-center gap-2">
        <div>
          <div
            className={
              transaction.type === "income"
                ? "text-green-600 font-semibold"
                : "text-red-500 font-semibold"
            }
          >
            {transaction.type === "income"
              ? `+${formatCurrency(transaction.amount)}`
              : `-${formatCurrency(transaction.amount)}`}
          </div>
          <div className="text-xs text-gray-400">
            {formatDate(transaction.date)}
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={onEdit}
            className="p-1 text-gray-400 hover:text-gray-600"
            title="Editar"
          >
            ✏️
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-gray-400 hover:text-red-600"
            title="Excluir"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
