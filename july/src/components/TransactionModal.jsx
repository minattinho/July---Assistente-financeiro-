import React, { useState, useEffect } from "react";
import { categoryService, accountService } from "../services/api.js";

export default function TransactionModal({
  isOpen,
  onClose,
  onSubmit,
  transaction = null,
  loading = false,
  initialType = "expense", // nova prop
}) {
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: initialType, // usar initialType
    date: new Date().toISOString().split("T")[0],
    category_id: "",
    account_id: "",
    notes: "",
    is_recurring: false,
    recurring_frequency: "monthly",
    recurring_end_date: "",
    parcelas: 1, // valor padrão
  });

  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // Carregar categorias e contas
  useEffect(() => {
    if (isOpen) {
      loadFormData();
    }
  }, [isOpen]);

  // Preencher formulário se for edição
  useEffect(() => {
    if (transaction) {
      setFormData({
        description: transaction.description || "",
        amount: transaction.amount || "",
        type: transaction.type || "expense",
        date: transaction.date
          ? new Date(transaction.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        category_id: transaction.category_id || "",
        account_id: transaction.account_id || "",
        notes: transaction.notes || "",
        is_recurring: transaction.is_recurring || false,
        recurring_frequency: transaction.recurring_frequency || "monthly",
        recurring_end_date: transaction.recurring_end_date
          ? new Date(transaction.recurring_end_date).toISOString().split("T")[0]
          : "",
        parcelas: transaction.total_parcelas || 1,
      });
    } else {
      setFormData({
        description: "",
        amount: "",
        type: initialType, // usar initialType
        date: new Date().toISOString().split("T")[0],
        category_id: "",
        account_id: "",
        notes: "",
        is_recurring: false,
        recurring_frequency: "monthly",
        recurring_end_date: "",
        parcelas: 1,
      });
    }
  }, [transaction, initialType]);

  const loadFormData = async () => {
    setLoadingData(true);
    try {
      const [categoriesResponse, accountsResponse] = await Promise.all([
        categoryService.getCategories(),
        accountService.getAccounts(),
      ]);

      setCategories(categoriesResponse.data || []);
      setAccounts(accountsResponse.data || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const submitData = {
      ...formData,
      amount: parseFloat(formData.amount),
      category_id: formData.category_id ? parseInt(formData.category_id) : null,
      account_id: formData.account_id ? parseInt(formData.account_id) : null,
    };

    // Remover campos vazios
    if (!submitData.is_recurring) {
      delete submitData.recurring_frequency;
      delete submitData.recurring_end_date;
    }
    // Remover parcelas se não for despesa ou não informado
    if (submitData.type !== "expense" || !submitData.parcelas) {
      delete submitData.parcelas;
    }

    onSubmit(submitData);
  };

  const handleClose = () => {
    setFormData({
      description: "",
      amount: "",
      type: initialType, // usar initialType
      date: new Date().toISOString().split("T")[0],
      category_id: "",
      account_id: "",
      notes: "",
      is_recurring: false,
      recurring_frequency: "monthly",
      recurring_end_date: "",
      parcelas: 1,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`bg-white rounded-xl p-6 w-full max-w-2xl ${
          formData.type === "expense"
            ? "border-t-8 border-red-600"
            : "border-t-8 border-green-600"
        }`}
      >
        {" "}
        {/* destaque colorido no topo */}
        <div className="flex justify-between items-center mb-6">
          <h2
            className={`text-2xl font-bold ${
              formData.type === "expense" ? "text-red-600" : "text-green-600"
            }`}
          >
            {" "}
            {/* cor do título */}
            {formData.type === "expense" ? "Despesa" : "Receita"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição *
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Ex: Salário, Supermercado, etc."
            />
          </div>

          {/* Valor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor *
            </label>
            <div className="flex items-center">
              <span className="mr-2 text-gray-500">R$</span>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                required
                min="0.01"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="0,00"
              />
            </div>
          </div>

          {/* Parcelas (apenas para despesas) */}
          {formData.type === "expense" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parcelas
              </label>
              <input
                type="number"
                name="parcelas"
                min="1"
                step="1"
                value={formData.parcelas || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="1"
              />
              {/* Exibir valor da parcela se preenchido */}
              {formData.parcelas > 1 && formData.amount && (
                <div className="text-xs text-gray-500 mt-1">
                  Valor de cada parcela: R${" "}
                  {(
                    parseFloat(formData.amount) / parseInt(formData.parcelas)
                  ).toFixed(2)}
                </div>
              )}
            </div>
          )}

          {/* Data */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data *
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={loadingData}
            >
              <option value="">Selecione uma categoria</option>
              {categories
                .filter((category) => category.type === formData.type)
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Conta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conta
            </label>
            <select
              name="account_id"
              value={formData.account_id}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={loadingData}
            >
              <option value="">Selecione uma conta</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Observações adicionais..."
            />
          </div>

          {/* Transação Recorrente */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="is_recurring"
                checked={formData.is_recurring}
                onChange={handleInputChange}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">
                Transação recorrente
              </span>
            </label>
          </div>

          {formData.is_recurring && (
            <div className="space-y-4 pl-6 border-l-2 border-gray-200">
              {/* Frequência */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequência
                </label>
                <select
                  name="recurring_frequency"
                  value={formData.recurring_frequency}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="daily">Diária</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensal</option>
                  <option value="yearly">Anual</option>
                </select>
              </div>

              {/* Data de Fim */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Fim
                </label>
                <input
                  type="date"
                  name="recurring_end_date"
                  value={formData.recurring_end_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex justify-between gap-4 mt-8">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`flex-1 py-3 rounded-lg font-semibold transition ${
                formData.type === "expense"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
              disabled={loading}
            >
              Criar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
