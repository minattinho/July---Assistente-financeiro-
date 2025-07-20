import React, { useState } from "react";
import logo from "../assets/logo.png";
import { useAuth } from "../hooks/useAuth";
import { useTransactions } from "../hooks/useTransactions";
import TransactionModal from "./TransactionModal";
import LoadingSpinner from "./LoadingSpinner";
import Notification from "./Notification";
import { Link, useLocation } from "react-router-dom";
import Layout from "./Layout";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const {
    transactions,
    loading,
    error,
    summary,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("income"); // Novo estado para o tipo
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "info",
  });

  const handleLogout = () => {
    logout();
  };

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
      console.error("Erro ao criar transação:", error);
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
      console.error("Erro ao atualizar transação:", error);
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
        console.error("Erro ao deletar transação:", error);
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
    });
  };

  const getCategoryColor = (index) => {
    const colors = [
      "bg-red-500",
      "bg-green-600",
      "bg-green-300",
      "bg-blue-500",
      "bg-gray-400",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
    ];
    return colors[index % colors.length];
  };

  // Debug: mostrar saldo calculado no console
  console.log("Saldo calculado:", summary.totalBalance);

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-1">
        Olá, {user?.name?.split(" ")[0] || "Usuário"}!
      </h1>
      <p className="text-gray-500 mb-6">
        Aqui está um resumo das suas finanças hoje
      </p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          Erro ao carregar dados: {error}
        </div>
      )}

      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Saldo Total */}
        <div className="bg-white rounded-xl p-6 shadow flex flex-col justify-between">
          <div className="text-gray-500 mb-2">Saldo Total</div>
          <div className="text-3xl font-bold mb-2">
            {loading ? (
              <LoadingSpinner size="sm" text="" />
            ) : (
              formatCurrency(summary.totalBalance)
            )}
          </div>
          <div className="flex items-center gap-2 text-green-600 text-sm">
            {summary.previousMonthBalance !== 0 ? (
              <span className="bg-green-100 px-2 py-0.5 rounded-full font-semibold">
                {(
                  ((summary.totalBalance - summary.previousMonthBalance) /
                    Math.abs(summary.previousMonthBalance)) *
                  100
                ).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}
                %
              </span>
            ) : null}
            {summary.previousMonthBalance !== 0 ? (
              <span className="text-gray-400">vs. mês anterior</span>
            ) : null}
          </div>
        </div>
        {/* Este Mês */}
        <div className="bg-white rounded-xl p-6 shadow flex flex-col justify-between">
          <div className="text-gray-500 mb-2">Este Mês</div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Receitas
              </span>
              <span className="text-green-600 font-semibold">
                {loading ? (
                  <LoadingSpinner size="sm" text="" />
                ) : (
                  formatCurrency(summary.monthlyIncome)
                )}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Despesas
              </span>
              <span className="text-red-500 font-semibold">
                {loading ? (
                  <LoadingSpinner size="sm" text="" />
                ) : (
                  formatCurrency(summary.monthlyExpenses)
                )}
              </span>
            </div>
          </div>
        </div>
        {/* Botões */}
        <div className="flex flex-col gap-2 justify-end">
          <button
            onClick={() => {
              setModalType("income");
              setModalOpen(true);
            }}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition"
          >
            + Adicionar Receita
          </button>
          <button
            onClick={() => {
              setModalType("expense");
              setModalOpen(true);
            }}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition"
          >
            + Adicionar Despesa
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        {/* Transações Recentes */}
        <div className="bg-white rounded-xl p-6 shadow">
          <div className="font-bold text-lg mb-2">Transações Recentes</div>
          <div className="text-gray-400 text-sm mb-4">
            Suas últimas movimentações
          </div>
          {loading ? (
            <LoadingSpinner text="Carregando transações..." />
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma transação encontrada
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {transactions.slice(0, 5).map((transaction) => (
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
        </div>
        {/* Gastos por Categoria */}
        <div className="bg-white rounded-xl p-6 shadow">
          <div className="font-bold text-lg mb-2">Gastos por Categoria</div>
          <div className="text-gray-400 text-sm mb-4">
            Distribuição dos gastos este mês
          </div>
          {loading ? (
            <LoadingSpinner text="Carregando categorias..." />
          ) : summary.categoryBreakdown.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum gasto registrado este mês
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {summary.categoryBreakdown.map((category, index) => (
                <CategoryBar
                  key={category.name}
                  name={category.name}
                  value={category.value}
                  percent={category.percent}
                  color={getCategoryColor(index)}
                />
              ))}
            </div>
          )}
        </div>
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
        initialType={modalType} // nova prop
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

function SidebarItem({ children, to, active }) {
  if (to) {
    return (
      <Link
        to={to}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition ${
          active ? "bg-green-600 text-white" : "hover:bg-gray-800 text-gray-300"
        }`}
      >
        {children}
      </Link>
    );
  }
  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition hover:bg-gray-800 text-gray-300`}
    >
      {children}
    </div>
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
      <div className="flex-1">
        <div className="font-semibold">{transaction.description}</div>
        <div className="text-xs text-gray-400">
          {transaction.category_name || "Sem categoria"}
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
              : formatCurrency(transaction.amount)}
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

function CategoryBar({ name, value, percent, color }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${color}`}></span>
          {name}
        </span>
        <span className="font-semibold">
          R$ {value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full`}
          style={{ width: `${percent}%` }}
        ></div>
      </div>
      <div className="text-xs text-gray-400 text-right">{percent}%</div>
    </div>
  );
}
