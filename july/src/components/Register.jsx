import React, { useState, useEffect } from "react";
import logo from "../assets/logo.png";
import { authService } from "../services/api";

export default function Register({ onRegister, onBackToLogin }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    plan: "free",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.body.classList.add("login-page");
    return () => {
      document.body.style.overflow = "unset";
      document.body.classList.remove("login-page");
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleInputFocus = (fieldName) => {
    setFocusedField(fieldName);
  };
  const handleInputBlur = () => {
    setFocusedField("");
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Nome é obrigatório");
      return false;
    }
    if (formData.name.trim().length < 2) {
      setError("Nome deve ter pelo menos 2 caracteres");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email é obrigatório");
      return false;
    }
    if (!formData.email.includes("@")) {
      setError("Email inválido");
      return false;
    }
    if (!formData.password.trim()) {
      setError("Senha é obrigatória");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Senha deve ter pelo menos 6 caracteres");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setError("");
    try {
      const data = await authService.register(formData);
      const user = data.user || (data.data && data.data.user);
      const token = data.token || (data.data && data.data.token);
      if (!user || !token)
        throw new Error("Erro ao registrar: dados de usuário ausentes.");
      localStorage.setItem("authToken", token);
      const firstName = user.name.split(" ")[0];
      localStorage.setItem("user", firstName);
      onRegister(user);
    } catch (err) {
      setError(err.message || "Erro ao criar conta. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const plans = [
    {
      id: "free",
      name: "Gratuito",
      price: "R$ 0",
      features: [
        "Até 100 transações/mês",
        "Relatórios básicos",
        "1 conta bancária",
      ],
    },
    {
      id: "premium",
      name: "Premium",
      price: "R$ 19,90/mês",
      features: [
        "Transações ilimitadas",
        "Relatórios avançados",
        "Múltiplas contas",
      ],
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-2">
      <div className="w-full max-w-md">
        {/* Card principal */}
        <div className="bg-white rounded-2xl shadow-xl p-3 sm:p-6 md:p-8 max-h-[95vh] overflow-y-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <img src={logo} alt="July Logo" className="h-16 w-16" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Crie sua conta
            </h2>
            <p className="text-base text-gray-700 font-medium">
              Comece a organizar suas finanças hoje mesmo
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome */}
            <div>
              <label
                htmlFor="name"
                className="block text-base font-semibold text-gray-800 mb-2"
              >
                Nome Completo
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                onFocus={() => handleInputFocus("name")}
                onBlur={handleInputBlur}
                className={`w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-600 transition duration-200 text-base placeholder:text-base font-medium bg-gray-50 shadow ${
                  focusedField === "name"
                    ? "border-green-600 ring-2 ring-green-400"
                    : "border-gray-300"
                }`}
                placeholder="Seu nome completo"
              />
            </div>
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-base font-semibold text-gray-800 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                onFocus={() => handleInputFocus("email")}
                onBlur={handleInputBlur}
                className={`w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-600 transition duration-200 text-base placeholder:text-base font-medium bg-gray-50 shadow ${
                  focusedField === "email"
                    ? "border-green-600 ring-2 ring-green-400"
                    : "border-gray-300"
                }`}
                placeholder="seu@email.com"
              />
            </div>
            {/* Senha */}
            <div>
              <label
                htmlFor="password"
                className="block text-base font-semibold text-gray-800 mb-2"
              >
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  onFocus={() => handleInputFocus("password")}
                  onBlur={handleInputBlur}
                  className={`w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-600 transition duration-200 pr-12 text-base placeholder:text-base font-medium bg-gray-50 shadow ${
                    focusedField === "password"
                      ? "border-green-600 ring-2 ring-green-400"
                      : "border-gray-300"
                  }`}
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                  aria-label="Mostrar/ocultar senha"
                >
                  {showPassword ? (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0c0 5-4.03 9-9 9s-9-4-9-9 4.03-9 9-9 9 4 9 9z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            {/* Confirmar Senha */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-base font-semibold text-gray-800 mb-2"
              >
                Confirmar Senha
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  onFocus={() => handleInputFocus("confirmPassword")}
                  onBlur={handleInputBlur}
                  className={`w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-600 transition duration-200 pr-12 text-base placeholder:text-base font-medium bg-gray-50 shadow ${
                    focusedField === "confirmPassword"
                      ? "border-green-600 ring-2 ring-green-400"
                      : "border-gray-300"
                  }`}
                  placeholder="Confirme sua senha"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                  aria-label="Mostrar/ocultar senha"
                >
                  {showConfirmPassword ? (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0c0 5-4.03 9-9 9s-9-4-9-9 4.03-9 9-9 9 4 9 9z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            {/* Termos */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="terms"
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mr-2"
                required
              />
              <label
                htmlFor="terms"
                className="text-sm text-gray-700 cursor-pointer"
              >
                Concordo com os{" "}
                <a href="#" className="underline">
                  Termos de Uso
                </a>{" "}
                e{" "}
                <a href="#" className="underline">
                  Política de Privacidade
                </a>
              </label>
            </div>
            {/* Seleção de Plano */}
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-2 text-center">
                Escolha seu plano
              </label>
              <div className="flex flex-col gap-3">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`border rounded-lg p-3 flex flex-col cursor-pointer transition-all duration-200 ${
                      formData.plan === plan.id
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, plan: plan.id }))
                    }
                  >
                    <span className="font-bold text-sm">{plan.name}</span>
                    <span className="text-green-600 font-bold text-base">
                      {plan.price}
                    </span>
                    <ul className="text-xs mt-1 space-y-0.5">
                      {plan.features.map((f, i) => (
                        <li key={i}>✓ {f}</li>
                      ))}
                    </ul>
                    {formData.plan === plan.id && (
                      <span className="text-green-500 text-xs mt-1">
                        Selecionado
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {/* Mensagem de erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center">
                <svg
                  className="h-5 w-5 mr-2 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            )}
            {/* Botão de cadastro */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-lg text-base font-semibold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Criando...
                </>
              ) : (
                <>
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Criar Conta
                </>
              )}
            </button>
          </form>
          {/* Link para login */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{" "}
              <button
                onClick={onBackToLogin}
                className="font-semibold text-green-600 hover:text-green-500 transition-colors"
              >
                Entrar
              </button>
            </p>
          </div>
        </div>
        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            © 2024 July. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
