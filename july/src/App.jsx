import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";
import Transactions from "./components/Transactions";
import Reports from "./components/Reports";
import Goals from "./components/Goals";
import Accounts from "./components/Accounts";
import Settings from "./components/Settings";
import Layout from "./components/Layout";

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/transacoes" element={<Transactions />} />
        <Route path="/relatorios" element={<Reports />} />
        <Route
          path="/metas"
          element={
            <Layout>
              <Goals />
            </Layout>
          }
        />
        <Route
          path="/contas"
          element={
            <Layout>
              <Accounts />
            </Layout>
          }
        />
        <Route
          path="/configuracoes"
          element={
            <Layout>
              <Settings />
            </Layout>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
