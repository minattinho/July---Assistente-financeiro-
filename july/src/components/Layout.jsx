import React from "react";
import logo from "../assets/logo.png";
import { useAuth } from "../hooks/useAuth";
import { useLocation, useNavigate } from "react-router-dom";

function SidebarItem({ children, to, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 rounded-lg cursor-pointer transition-colors ${
        active ? "bg-green-700 text-white" : "hover:bg-gray-800 text-gray-200"
      }`}
    >
      {children}
    </div>
  );
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-black text-white flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 px-6 py-6">
            <img src={logo} alt="Logo" className="h-24 w-24" />
          </div>
          <div className="px-6 pb-4">
            <div className="mb-6">
              <div className="font-semibold">{user?.name || "Usuário"}</div>
              <div className="text-xs text-gray-400">
                {user?.plan === "free"
                  ? "Plano Gratuito"
                  : user?.plan === "premium"
                  ? "Plano Premium"
                  : "Plano Pro"}
              </div>
            </div>
            <nav className="flex flex-col gap-2">
              <SidebarItem
                to="/"
                active={location.pathname === "/"}
                onClick={() => navigate("/")}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"
                  />
                </svg>
                Dashboard
              </SidebarItem>
              <SidebarItem
                to="/transacoes"
                active={location.pathname === "/transacoes"}
                onClick={() => navigate("/transacoes")}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Transações
              </SidebarItem>
              <SidebarItem
                to="/relatorios"
                active={location.pathname === "/relatorios"}
                onClick={() => navigate("/relatorios")}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Relatórios
              </SidebarItem>
              <SidebarItem
                to="/metas"
                active={location.pathname === "/metas"}
                onClick={() => navigate("/metas")}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Metas
              </SidebarItem>
              <SidebarItem
                to="/contas"
                active={location.pathname === "/contas"}
                onClick={() => navigate("/contas")}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                Contas
              </SidebarItem>
              <SidebarItem
                to="/configuracoes"
                active={location.pathname === "/configuracoes"}
                onClick={() => navigate("/configuracoes")}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Configurações
              </SidebarItem>
            </nav>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-800">
          <div className="text-xs text-gray-400 mb-2">
            <div>Notificações</div>
            <div>Você tem 3 notificações não lidas</div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition duration-200"
          >
            Sair
          </button>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">{children}</main>
    </div>
  );
}
