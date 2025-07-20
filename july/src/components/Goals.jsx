import React, { useEffect, useState } from "react";
import { goalService } from "../services/api";
import LoadingSpinner from "./LoadingSpinner";

const TABS = [
  { label: "Economia", value: "economia" },
  { label: "Controle de Gastos", value: "controle" },
  { label: "Investimentos", value: "investimento" },
];

const TAG_COLORS = {
  Alta: "bg-pink-200 text-pink-700",
  Média: "bg-yellow-100 text-yellow-700",
  Baixa: "bg-green-100 text-green-700",
  Emergência: "bg-purple-100 text-purple-700",
  Educação: "bg-purple-100 text-purple-700",
  Lazer: "bg-pink-100 text-pink-700",
  Tecnologia: "bg-indigo-100 text-indigo-700",
  Redução: "bg-blue-100 text-blue-700",
  Investimentos: "bg-fuchsia-100 text-fuchsia-700",
  "+12.5% a.a.": "bg-green-100 text-green-700",
  "+8.3% a.a.": "bg-green-100 text-green-700",
  "No Prazo": "bg-green-100 text-green-700",
  Atrasada: "bg-red-100 text-red-700",
  Controle: "bg-blue-100 text-blue-700",
  Transporte: "bg-pink-100 text-pink-700",
  Alimentação: "bg-orange-100 text-orange-700",
  Entretenimento: "bg-fuchsia-100 text-fuchsia-700",
};

function getStatus(goal) {
  if (goal.is_completed) return "Concluída";
  if (
    goal.deadline &&
    new Date(goal.deadline) < new Date() &&
    !goal.is_completed
  )
    return "Atrasada";
  return "Em Andamento";
}

function GoalCard({ goal, onEdit, onDelete }) {
  const progresso = Math.min(
    100,
    (goal.current_amount / goal.target_amount) * 100 || 0
  );
  const diasRestantes = goal.deadline
    ? Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24))
    : null;
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-2 min-w-[340px] border border-gray-100 relative transition hover:shadow-lg">
      <button
        onClick={() => onEdit(goal)}
        title="Editar"
        className="absolute top-4 right-4 text-gray-400 hover:text-blue-500"
      >
        <span className="material-symbols-outlined text-xl">edit</span>
      </button>
      <div className="font-semibold text-lg mb-1 text-gray-800">
        {goal.name}
      </div>
      {goal.subtitle && (
        <div className="text-gray-500 text-sm mb-1">{goal.subtitle}</div>
      )}
      <div className="flex gap-2 flex-wrap text-xs mb-2">
        {goal.tags &&
          goal.tags.map((tag, i) => (
            <span
              key={i}
              className={`px-2 py-0.5 rounded-full font-semibold shadow-sm ${
                TAG_COLORS[tag] || "bg-gray-100 text-gray-600"
              }`}
            >
              {tag}
            </span>
          ))}
        {goal.priority && (
          <span className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 font-semibold shadow-sm">
            {goal.priority}
          </span>
        )}
        {goal.category && (
          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold shadow-sm">
            {goal.category}
          </span>
        )}
        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold shadow-sm">
          {getStatus(goal)}
        </span>
      </div>
      <div className="text-xs text-gray-500 font-medium mt-2">Progresso</div>
      <div className="flex items-center gap-2">
        <span className="text-green-600 font-semibold text-base">
          R${" "}
          {goal.current_amount?.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })}
        </span>
        <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            style={{
              width: progresso + "%",
              background: goal.color || "#8B5CF6",
            }}
            className="h-full transition-all"
          ></div>
        </div>
        <span className="text-xs text-gray-500 font-semibold">
          {progresso.toFixed(1)}%
        </span>
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1 font-medium">
        <span>
          R${" "}
          {goal.target_amount?.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
          })}
        </span>
        <span>
          {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : ""}
        </span>
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>
          {diasRestantes !== null ? `${diasRestantes} dias restantes` : ""}
        </span>
        <button
          onClick={() => onDelete(goal)}
          className="text-red-400 hover:text-red-600"
          title="Excluir"
        >
          <span className="material-symbols-outlined text-base">delete</span>
        </button>
      </div>
    </div>
  );
}

function GoalForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(
    initial || {
      name: "",
      subtitle: "",
      description: "",
      tags: [],
      priority: "",
      category: "",
      type: "economia",
      target_amount: "",
      current_amount: "0",
      meta_month: "",
      current_month: "",
      difference: "",
      deadline: "",
      color: "#8B5CF6",
    }
  );
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }
  function handleTagAdd(e) {
    e.preventDefault();
    if (tagInput && !form.tags.includes(tagInput)) {
      setForm({ ...form, tags: [...form.tags, tagInput] });
      setTagInput("");
    }
  }
  function handleTagRemove(tag) {
    setForm({ ...form, tags: form.tags.filter((t) => t !== tag) });
  }
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await onSave({
        ...form,
        target_amount: parseFloat(form.target_amount),
        current_amount: parseFloat(form.current_amount),
        meta_month: form.meta_month ? parseFloat(form.meta_month) : null,
        current_month: form.current_month
          ? parseFloat(form.current_month)
          : null,
        difference: form.difference ? parseFloat(form.difference) : null,
      });
    } catch (err) {
      setError("Erro ao salvar meta. Tente novamente.");
      setLoading(false);
      return;
    }
    setLoading(false);
  }
  return (
    <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full animate-fade-in mx-auto">
      {/* Barra superior verde */}
      <div className="h-1.5 w-full rounded-t-2xl bg-green-500" />
      {/* Botão de fechar */}
      <button
        type="button"
        onClick={onCancel}
        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold focus:outline-none transition"
        aria-label="Fechar"
      >
        ×
      </button>
      <div className="overflow-y-auto" style={{ maxHeight: "80vh" }}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-8">
          <div className="text-2xl font-bold mb-2 text-green-600 text-left">
            {initial ? "Editar Meta" : "Nova Meta"}
          </div>
          {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Nome da meta *"
            className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-green-400 focus:outline-none text-base bg-gray-50"
            required
          />
          <input
            name="subtitle"
            value={form.subtitle}
            onChange={handleChange}
            placeholder="Subtítulo"
            className="border border-gray-300 rounded-lg px-4 py-2 w-full text-base bg-gray-50"
          />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Descrição"
            className="border border-gray-300 rounded-lg px-4 py-2 w-full min-h-[60px] text-base bg-gray-50"
          />
          {/* Tags */}
          <div className="flex gap-2 items-center">
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Adicionar tag"
              className="border border-gray-300 rounded-lg px-4 py-2 flex-1 text-base bg-gray-50"
            />
            <button
              onClick={handleTagAdd}
              className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 py-2 text-sm font-semibold transition shadow"
              type="button"
            >
              Adicionar
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {form.tags.map((tag, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs flex items-center gap-1 border border-green-300"
              >
                {tag}{" "}
                <button
                  type="button"
                  onClick={() => handleTagRemove(tag)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <input
            name="priority"
            value={form.priority}
            onChange={handleChange}
            placeholder="Prioridade"
            className="border border-gray-300 rounded-lg px-4 py-2 w-full text-base bg-gray-50"
          />
          {/* Campo de categoria - agora é um select */}
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full text-base bg-gray-50"
            required
          >
            <option value="">Selecione a categoria *</option>
            {META_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full text-base bg-gray-50"
          >
            {TABS.map((tab) => (
              <option key={tab.value} value={tab.value}>
                {tab.label}
              </option>
            ))}
          </select>
          <input
            name="target_amount"
            value={form.target_amount}
            onChange={handleChange}
            placeholder="Valor alvo *"
            type="number"
            min="0"
            step="0.01"
            className="border border-gray-300 rounded-lg px-4 py-2 w-full text-base bg-gray-50"
            required
          />
          <input
            name="current_amount"
            value={form.current_amount}
            onChange={handleChange}
            placeholder="Valor atual"
            type="number"
            min="0"
            step="0.01"
            className="border border-gray-300 rounded-lg px-4 py-2 w-full text-base bg-gray-50"
          />
          <input
            name="meta_month"
            value={form.meta_month}
            onChange={handleChange}
            placeholder="Meta do mês"
            type="number"
            min="0"
            step="0.01"
            className="border border-gray-300 rounded-lg px-4 py-2 w-full text-base bg-gray-50"
          />
          <input
            name="current_month"
            value={form.current_month}
            onChange={handleChange}
            placeholder="Gasto atual do mês"
            type="number"
            min="0"
            step="0.01"
            className="border border-gray-300 rounded-lg px-4 py-2 w-full text-base bg-gray-50"
          />
          <input
            name="difference"
            value={form.difference}
            onChange={handleChange}
            placeholder="Diferença"
            type="number"
            step="0.01"
            className="border border-gray-300 rounded-lg px-4 py-2 w-full text-base bg-gray-50"
          />
          <input
            name="deadline"
            value={form.deadline}
            onChange={handleChange}
            placeholder="Data limite"
            type="date"
            className="border border-gray-300 rounded-lg px-4 py-2 w-full text-base bg-gray-50"
          />
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-500">Cor:</label>
            <input
              name="color"
              value={form.color}
              onChange={handleChange}
              type="color"
              className="w-10 h-8 p-0 border-none rounded shadow"
            />
          </div>
          <div className="flex gap-4 mt-6 justify-end">
            <button
              type="button"
              className="border border-gray-300 rounded-lg px-8 py-2 text-base font-semibold text-gray-700 bg-white hover:bg-gray-100 transition"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-8 py-2 text-base font-semibold transition shadow"
              disabled={loading}
            >
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [tab, setTab] = useState("economia");

  async function fetchGoals() {
    setLoading(true);
    try {
      const res = await goalService.getGoals();
      setGoals(res.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchGoals();
  }, []);

  async function handleSave(goal) {
    if (editing) {
      await goalService.updateGoal(editing.id, goal);
    } else {
      await goalService.createGoal(goal);
    }
    setShowForm(false);
    setEditing(null);
    fetchGoals();
  }

  async function handleDelete(goal) {
    if (window.confirm("Tem certeza que deseja excluir esta meta?")) {
      await goalService.deleteGoal(goal.id);
      fetchGoals();
    }
  }

  // Estatísticas
  const filteredGoals = goals.filter((g) => g.type === tab);
  const total = filteredGoals.length;
  const concluidas = filteredGoals.filter((g) => g.is_completed).length;
  const emAndamento = filteredGoals.filter(
    (g) => getStatus(g) === "Em Andamento"
  ).length;
  const atrasadas = filteredGoals.filter(
    (g) => getStatus(g) === "Atrasada"
  ).length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Metas Financeiras</h1>
          <p className="text-gray-500">
            Defina e acompanhe seus objetivos financeiros
          </p>
        </div>
        <button
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-2 rounded-lg shadow transition-colors"
          onClick={() => {
            setShowForm(true);
            setEditing(null);
          }}
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Nova Meta
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center border border-gray-100 min-h-[100px] relative">
          <span className="material-symbols-outlined text-blue-500 text-3xl absolute top-4 left-4 bg-blue-100 rounded-full p-2">
            target
          </span>
          <div className="text-2xl font-bold mt-2">{total}</div>
          <div className="text-gray-500 text-sm">Total de Metas</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center border border-gray-100 min-h-[100px] relative">
          <span className="material-symbols-outlined text-green-500 text-3xl absolute top-4 left-4 bg-green-100 rounded-full p-2">
            check_circle
          </span>
          <div className="text-2xl font-bold mt-2">{concluidas}</div>
          <div className="text-gray-500 text-sm">Concluídas</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center border border-gray-100 min-h-[100px] relative">
          <span className="material-symbols-outlined text-sky-500 text-3xl absolute top-4 left-4 bg-sky-100 rounded-full p-2">
            trending_up
          </span>
          <div className="text-2xl font-bold mt-2">{emAndamento}</div>
          <div className="text-gray-500 text-sm">Em Andamento</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center border border-gray-100 min-h-[100px] relative">
          <span className="material-symbols-outlined text-red-500 text-3xl absolute top-4 left-4 bg-red-100 rounded-full p-2">
            error
          </span>
          <div className="text-2xl font-bold mt-2">{atrasadas}</div>
          <div className="text-gray-500 text-sm">Atrasadas</div>
        </div>
      </div>
      {/* Abas estilizadas */}
      <div className="flex gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t.value}
            className={`px-5 py-2 rounded-lg font-medium border transition-colors text-sm
              ${
                tab === t.value
                  ? "bg-green-100 border-green-500 text-green-700 shadow"
                  : "bg-white border-gray-200 text-gray-500 hover:bg-gray-100"
              }
            `}
            onClick={() => setTab(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={(g) => {
                setEditing(g);
                setShowForm(true);
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-2xl p-0 border border-gray-200 animate-fade-in flex flex-col gap-4 relative"
            style={{ marginTop: "0px" }}
          >
            <GoalForm
              initial={editing}
              onSave={handleSave}
              onCancel={() => {
                setShowForm(false);
                setEditing(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
