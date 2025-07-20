import React, { useEffect, useState } from "react";
import { accountService } from "../services/api";
import LoadingSpinner from "./LoadingSpinner";

const TABS = [
  { label: "Contas Ativas", key: "active" },
  { label: "Inativas", key: "inactive" },
];

function formatCurrency(value) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

function NovaContaModal({ isOpen, onClose, onSave, loading, initial }) {
  const [form, setForm] = useState({
    nome: "",
    banco: "",
    tipo: "conta_corrente",
    saldoDisponivel: "",
    numero: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (initial) {
        setForm({
          nome: initial.nome || "",
          banco: initial.banco || "",
          tipo: initial.tipo || "conta_corrente",
          saldoDisponivel:
            initial.saldoDisponivel !== undefined
              ? initial.saldoDisponivel
              : "",
          numero: initial.numero || "",
        });
      } else {
        setForm({
          nome: "",
          banco: "",
          tipo: "conta_corrente",
          saldoDisponivel: "",
          numero: "",
        });
      }
      setError("");
    }
  }, [isOpen, initial]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.nome.trim() || !form.banco.trim()) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }
    onSave({
      ...form,
      saldoDisponivel: parseFloat(form.saldoDisponivel) || 0,
    });
  }

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 text-green-600">Nova Conta</h2>
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            name="nome"
            value={form.nome}
            onChange={handleChange}
            placeholder="Nome da conta *"
            className="border rounded px-3 py-2"
            required
          />
          <input
            name="banco"
            value={form.banco}
            onChange={handleChange}
            placeholder="Banco *"
            className="border rounded px-3 py-2"
            required
          />
          <input
            name="numero"
            value={form.numero}
            onChange={handleChange}
            placeholder="Número (opcional)"
            className="border rounded px-3 py-2"
          />
          <select
            name="tipo"
            value={form.tipo}
            onChange={handleChange}
            className="border rounded px-3 py-2"
          >
            <option value="conta_corrente">Conta Corrente</option>
            <option value="poupanca">Poupança</option>
            <option value="investimento">Investimento</option>
            <option value="carteira_digital">Carteira Digital</option>
            <option value="cartao_credito">Cartão de Crédito</option>
          </select>
          <input
            name="saldoDisponivel"
            value={form.saldoDisponivel}
            onChange={handleChange}
            placeholder="Saldo Inicial"
            className="border rounded px-3 py-2"
            type="number"
            min="0"
            step="0.01"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white rounded px-4 py-2 font-semibold hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("active");
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editAccount, setEditAccount] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    async function fetchAccounts() {
      setLoading(true);
      setError(null);
      try {
        const data = await accountService.getAccounts();
        console.log("RETORNO API CONTAS:", data);
        setAccounts(
          Array.isArray(data) ? data : data.data || data.accounts || []
        );
      } catch (err) {
        setError("Erro ao buscar contas.");
      } finally {
        setLoading(false);
      }
    }
    fetchAccounts();
  }, []);

  async function handleNovaConta(form) {
    setModalLoading(true);
    try {
      const payload = {
        name: form.nome,
        type: form.tipo,
        balance: parseFloat(form.saldoDisponivel) || 0,
        color: "#22c55e",
        description: form.banco
          ? `Banco: ${form.banco}${form.numero ? " - Nº " + form.numero : ""}`
          : "",
      };
      console.log("ENVIANDO NOVA CONTA:", payload);
      await accountService.createAccount(payload);
      // Atualiza lista
      const data = await accountService.getAccounts();
      setAccounts(
        Array.isArray(data) ? data : data.data || data.accounts || []
      );
      setModalOpen(false);
    } catch (e) {
      alert("Erro ao criar conta. Tente novamente.");
    } finally {
      setModalLoading(false);
    }
  }

  async function handleEditAccount(form) {
    setModalLoading(true);
    try {
      const payload = {
        name: form.nome,
        type: form.tipo,
        balance: parseFloat(form.saldoDisponivel) || 0,
        color: form.color || "#22c55e",
        description: form.banco
          ? `Banco: ${form.banco}${form.numero ? " - Nº " + form.numero : ""}`
          : form.description || "",
      };
      await accountService.updateAccount(editAccount.id, payload);
      const data = await accountService.getAccounts();
      setAccounts(
        Array.isArray(data) ? data : data.data || data.accounts || []
      );
      setEditModalOpen(false);
      setEditAccount(null);
    } catch (e) {
      alert("Erro ao editar conta. Tente novamente.");
    } finally {
      setModalLoading(false);
    }
  }

  async function handleDeleteAccount(id) {
    if (!window.confirm("Tem certeza que deseja excluir esta conta?")) return;
    setDeleteLoading(true);
    setDeleteId(id);
    try {
      await accountService.deleteAccount(id);
      const data = await accountService.getAccounts();
      setAccounts(
        Array.isArray(data) ? data : data.data || data.accounts || []
      );
    } catch (e) {
      alert("Erro ao excluir conta. Tente novamente.");
    } finally {
      setDeleteLoading(false);
      setDeleteId(null);
    }
  }

  function mapAccountToForm(acc) {
    // Mapeia os campos do backend para o formulário
    return {
      nome: acc.name || acc.nome || "",
      banco: acc.description
        ? acc.description.split("Banco: ")[1]?.split(" - Nº ")[0] || ""
        : "",
      numero:
        acc.description && acc.description.includes("Nº")
          ? acc.description.split("Nº ")[1]
          : "",
      tipo: acc.type || acc.tipo || "conta_corrente",
      saldoDisponivel:
        acc.balance !== undefined ? acc.balance : acc.saldoDisponivel || 0,
      color: acc.color || "#22c55e",
      description: acc.description || "",
    };
  }

  const filteredAccounts = accounts.filter((acc) =>
    tab === "active"
      ? acc.ativa || acc.is_active
      : !(acc.ativa || acc.is_active)
  );

  // Cálculos para os cards superiores
  const saldoTotal = accounts
    .filter((a) => a.ativa || a.is_active)
    .reduce((sum, a) => sum + (a.saldoDisponivel || 0), 0);
  const contasAtivas = accounts.filter((a) => a.ativa || a.is_active).length;
  const contasInativas = accounts.filter(
    (a) => !(a.ativa || a.is_active)
  ).length;
  const cartoesCredito = accounts.filter(
    (a) => (a.tipo || a.type) === "cartao_credito" && (a.ativa || a.is_active)
  ).length;
  const investimentos = accounts
    .filter(
      (a) => (a.tipo || a.type) === "investimento" && (a.ativa || a.is_active)
    )
    .reduce((sum, a) => sum + (a.saldoDisponivel || a.balance || 0), 0);

  const TAG_COLORS = {
    investimento: "bg-orange-100 text-orange-700",
    cartao_credito: "bg-purple-100 text-purple-700",
    carteira_digital: "bg-green-100 text-green-700",
    conta_corrente: "bg-green-100 text-green-700",
    poupanca: "bg-blue-100 text-blue-700",
    default: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="p-8 w-full">
      <h1 className="text-3xl font-bold mb-1">Contas</h1>
      <p className="text-gray-500 mb-6">
        Gerencie todas as suas contas financeiras
      </p>

      {/* Cards superiores */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-6 shadow flex flex-col items-center">
          <span className="text-gray-500">Saldo Total</span>
          <span className="text-2xl font-bold text-green-700">
            {formatCurrency(saldoTotal)}
          </span>
        </div>
        <div className="bg-white rounded-lg p-6 shadow flex flex-col items-center">
          <span className="text-gray-500">Contas Ativas</span>
          <span className="text-2xl font-bold text-green-600">
            {contasAtivas}
          </span>
        </div>
        <div className="bg-white rounded-lg p-6 shadow flex flex-col items-center">
          <span className="text-gray-500">Cartões de Crédito</span>
          <span className="text-2xl font-bold text-purple-600">
            {cartoesCredito}
          </span>
        </div>
        <div className="bg-white rounded-lg p-6 shadow flex flex-col items-center">
          <span className="text-gray-500">Investimentos</span>
          <span className="text-2xl font-bold text-orange-500">
            {formatCurrency(investimentos)}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          className={`px-4 py-2 rounded font-medium ${
            tab === "active"
              ? "bg-green-500 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
          onClick={() => setTab("active")}
        >
          Contas Ativas ({contasAtivas})
        </button>
        <button
          className={`px-4 py-2 rounded font-medium ${
            tab === "inactive"
              ? "bg-green-500 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
          onClick={() => setTab("inactive")}
        >
          Inativas ({contasInativas})
        </button>
        <div className="flex-1" />
        <button className="border border-green-500 text-green-600 px-4 py-2 rounded mr-2 hover:bg-green-50">
          Transferir
        </button>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          onClick={() => setModalOpen(true)}
        >
          + Nova Conta
        </button>
      </div>

      {/* Cards de contas */}
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : filteredAccounts.length === 0 ? (
        <div className="text-gray-500">Nenhuma conta encontrada.</div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filteredAccounts.map((acc) => (
            <div
              key={acc.id}
              className="bg-white rounded-lg p-5 shadow flex flex-col gap-2 relative group"
            >
              <div className="flex items-center gap-2 mb-2">
                {/* Ícone da conta (pode ser melhorado depois) */}
                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                  <span className="text-xl">🏦</span>
                </div>
                <div>
                  <div className="font-semibold text-lg">
                    {acc.nome || acc.name}
                  </div>
                  <div className="text-xs text-gray-400">
                    {acc.description || acc.banco}{" "}
                    {acc.numeroOculto || acc.numero || ""}
                  </div>
                </div>
                {/* Menu de opções */}
                <div className="ml-auto relative">
                  <button
                    className="text-gray-400 hover:text-gray-700 px-2 py-1 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditAccount(acc);
                      setEditModalOpen(true);
                    }}
                    title="Editar conta"
                  >
                    ✏️
                  </button>
                  <button
                    className="text-gray-400 hover:text-red-600 px-2 py-1 rounded-full focus:outline-none focus:ring-2 focus:ring-red-400 ml-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteAccount(acc.id);
                    }}
                    title="Excluir conta"
                    disabled={deleteLoading && deleteId === acc.id}
                  >
                    {deleteLoading && deleteId === acc.id ? "⏳" : "🗑️"}
                  </button>
                </div>
              </div>
              <div className="flex gap-2 mb-1">
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    TAG_COLORS[acc.tipo || acc.type] || TAG_COLORS.default
                  }`}
                >
                  {(acc.tipo || acc.type || "")
                    .replace("_", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
                {acc.ativa ||
                  (acc.is_active && (
                    <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">
                      Ativa
                    </span>
                  ))}
              </div>
              <div className="text-sm text-gray-500">Saldo Disponível</div>
              <div className="text-xl font-bold text-green-700">
                {formatCurrency(acc.saldoDisponivel || 0)}
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Última movimentação
                <br />
                {acc.ultimaMovimentacao
                  ? new Date(acc.ultimaMovimentacao).toLocaleDateString()
                  : "-"}
              </div>
              {/* Botão de opções (pode ser implementado depois) */}
              <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700">
                •••
              </button>
            </div>
          ))}
        </div>
      )}
      {/* Modal de Nova Conta */}
      <NovaContaModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleNovaConta}
        loading={modalLoading}
      />
      {/* Modal de Editar Conta */}
      <NovaContaModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditAccount(null);
        }}
        onSave={handleEditAccount}
        loading={modalLoading}
        initial={editAccount ? mapAccountToForm(editAccount) : null}
      />
    </div>
  );
}
