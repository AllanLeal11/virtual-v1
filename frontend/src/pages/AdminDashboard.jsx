import React, { useState, useEffect } from "react";
import { useNavigate, Routes, Route, Link, useLocation } from "react-router-dom";
import { MessageSquare, Users, FolderKanban, LogOut, Menu, X, Bot, Zap } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import ChatHub from "../components/admin/ChatHub";
import ClientsCRM from "../components/admin/ClientsCRM";
import ProjectsPanel from "../components/admin/ProjectsPanel";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SIDEBAR_ITEMS = [
  { path: "/admin/dashboard", label: "Chat Hub", icon: MessageSquare },
  { path: "/admin/dashboard/clients", label: "Clientes CRM", icon: Users },
  { path: "/admin/dashboard/projects", label: "Proyectos", icon: FolderKanban }
];

const AGENTS = [
  { emoji: "💼", name: "Carlos", role: "Ventas" },
  { emoji: "💻", name: "Rodrigo", role: "Developer" },
  { emoji: "🎨", name: "Sofía", role: "UI/UX" },
  { emoji: "📋", name: "Mariana", role: "PM" },
  { emoji: "📣", name: "Diego", role: "Marketing" },
  { emoji: "🔧", name: "Kevin", role: "Soporte" },
  { emoji: "⚙️", name: "Luis", role: "Automation" },
  { emoji: "📊", name: "Valeria", role: "Admin" },
  { emoji: "🔍", name: "Andrea", role: "Analyst" },
  { emoji: "🤖", name: "Coordinador", role: "General" }
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("vertice_token");
    const username = localStorage.getItem("vertice_user");
    
    if (!token) {
      navigate("/admin");
      return;
    }

    // Verify token
    axios.get(`${API}/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => {
      setUser(username || "Admin");
    }).catch(() => {
      localStorage.removeItem("vertice_token");
      localStorage.removeItem("vertice_user");
      navigate("/admin");
    });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("vertice_token");
    localStorage.removeItem("vertice_user");
    toast.success("Sesión cerrada");
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-[#0d1b2a] flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-[#16213e] border-r border-white/10">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#f0a500] rounded flex items-center justify-center">
              <span className="font-bold text-[#0d1b2a] text-xl font-['Syne']">V</span>
            </div>
            <div>
              <span className="font-bold text-lg text-[#e2e8f0] font-['Syne']">Vértice Digital</span>
              <p className="text-[#8892a4] text-xs">Panel Admin</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {SIDEBAR_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link flex items-center gap-3 px-4 py-3 rounded border-l-2 border-transparent ${
                location.pathname === item.path ? "active" : "text-[#8892a4]"
              }`}
              data-testid={`sidebar-${item.label.toLowerCase().replace(" ", "-")}`}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Agents List */}
        <div className="p-4 border-t border-white/10">
          <p className="text-[#8892a4] text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
            <Bot size={14} /> Agentes IA
          </p>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {AGENTS.map((agent, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-[#8892a4] py-1">
                <span>{agent.emoji}</span>
                <span>{agent.name}</span>
                <span className="text-xs text-[#8892a4]/60">({agent.role})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-sm text-[#8892a4] mb-2">
            <Zap size={14} className="text-green-400" />
            <span>OpenAI GPT-4o</span>
          </div>
          <div className="text-xs text-[#8892a4]/60">Emergent LLM Key activa</div>
        </div>

        {/* User & Logout */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#e2e8f0] font-medium">{user}</p>
              <p className="text-[#8892a4] text-xs">CEO</p>
            </div>
            <button 
              onClick={handleLogout}
              className="text-[#8892a4] hover:text-[#f0a500] transition-colors"
              data-testid="logout-btn"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </aside>

      {/* Sidebar - Mobile Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setSidebarOpen(false)}>
          <aside className="w-72 bg-[#16213e] h-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#f0a500] rounded flex items-center justify-center">
                  <span className="font-bold text-[#0d1b2a] text-xl font-['Syne']">V</span>
                </div>
                <span className="font-bold text-lg text-[#e2e8f0] font-['Syne']">Vértice</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-[#8892a4]">
                <X size={24} />
              </button>
            </div>
            <nav className="p-4 space-y-2">
              {SIDEBAR_ITEMS.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`sidebar-link flex items-center gap-3 px-4 py-3 rounded border-l-2 border-transparent ${
                    location.pathname === item.path ? "active" : "text-[#8892a4]"
                  }`}
                >
                  <item.icon size={20} />
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t border-white/10">
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-[#8892a4] hover:text-[#f0a500]"
              >
                <LogOut size={20} />
                Cerrar Sesión
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden bg-[#16213e] border-b border-white/10 px-4 py-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="text-[#e2e8f0]" data-testid="mobile-menu-btn">
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#f0a500] rounded flex items-center justify-center">
              <span className="font-bold text-[#0d1b2a] font-['Syne']">V</span>
            </div>
            <span className="font-bold text-[#e2e8f0] font-['Syne']">Vértice</span>
          </div>
          <button onClick={handleLogout} className="text-[#8892a4]">
            <LogOut size={20} />
          </button>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <Routes>
            <Route index element={<ChatHub />} />
            <Route path="clients" element={<ClientsCRM />} />
            <Route path="projects" element={<ProjectsPanel />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
