import React, { useState } from "react";
import Login from "./Login";
import Register from "./Register";
import { useAuth } from "../hooks/useAuth";

export default function Auth() {
  const [currentView, setCurrentView] = useState("login"); // 'login' ou 'register'
  const { login, register } = useAuth();

  const handleLogin = (userData) => {
    login(userData);
  };

  const handleRegister = (userData) => {
    register(userData);
  };

  const showLogin = () => setCurrentView("login");
  const showRegister = () => setCurrentView("register");

  return (
    <div>
      {currentView === "login" ? (
        <Login onLogin={handleLogin} onShowRegister={showRegister} />
      ) : (
        <Register onRegister={handleRegister} onBackToLogin={showLogin} />
      )}
    </div>
  );
}
