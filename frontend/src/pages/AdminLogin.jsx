import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API}/auth/login`, form);
      localStorage.setItem("vertice_token", response.data.token);
      localStorage.setItem("vertice_user", response.data.username);
      toast.success(`¡Bienvenido, ${response.data.username}!`);
      navigate("/admin/dashboard");
    } catch (err) {
      setError("Credenciales inválidas. Intenta de nuevo.");
      toast.error("Error de autenticación");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0d1b2a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#f0a500] rounded flex items-center justify-center">
              <span className="font-bold text-[#0d1b2a] text-2xl font-['Syne']">V</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-[#e2e8f0] font-['Syne']">Panel de Administración</h1>
          <p className="text-[#8892a4] mt-2">Vértice Digital</p>
        </div>

        {/* Login Form */}
        <form 
          onSubmit={handleSubmit}
          className="bg-[#16213e] border border-white/10 rounded-md p-8"
          data-testid="admin-login-form"
        >
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded p-3 mb-6 text-red-400 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-[#8892a4] text-sm mb-2">Usuario</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8892a4]" size={18} />
                <input
                  type="text"
                  required
                  value={form.username}
                  onChange={(e) => setForm({...form, username: e.target.value})}
                  className="w-full bg-[#0d1b2a] border border-white/10 rounded px-4 py-3 pl-10 text-[#e2e8f0] placeholder-[#8892a4]"
                  placeholder="Ingresa tu usuario"
                  data-testid="login-username"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#8892a4] text-sm mb-2">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8892a4]" size={18} />
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({...form, password: e.target.value})}
                  className="w-full bg-[#0d1b2a] border border-white/10 rounded px-4 py-3 pl-10 text-[#e2e8f0] placeholder-[#8892a4]"
                  placeholder="Ingresa tu contraseña"
                  data-testid="login-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#f0a500] text-[#0d1b2a] font-bold py-3 hover:bg-[#d49100] transition-colors disabled:opacity-50"
              data-testid="login-submit"
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </div>
        </form>

        <p className="text-center text-[#8892a4] text-sm mt-6">
          <a href="/" className="hover:text-[#f0a500] transition-colors">← Volver al sitio</a>
        </p>
      </div>
    </div>
  );
}
