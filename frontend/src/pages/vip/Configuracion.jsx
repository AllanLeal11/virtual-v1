import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  me, getBotConfig, updateBotConfig,
  listResponses, createResponse, deleteResponse,
  getStats, getVipToken, clearVipToken,
} from "../../lib/vipApi";

const styles = `
  .vipc { min-height: 100vh; background: #0a0a0f; color: #f0f0f8; font-family: 'DM Sans', sans-serif; }
  .vipc-header { background: #12121a; border-bottom: 1px solid rgba(255,255,255,0.07); padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; }
  .vipc-logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px; }
  .vipc-logo span { color: #00e5a0; }
  .vipc-user { font-size: 13px; color: #6b6b8a; display: flex; align-items: center; gap: 12px; }
  .vipc-logout { background: none; border: 1px solid rgba(255,255,255,0.1); color: #6b6b8a; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 12px; }
  .vipc-layout { display: grid; grid-template-columns: 240px 1fr; min-height: calc(100vh - 60px); }
  @media (max-width: 768px) { .vipc-layout { grid-template-columns: 1fr; } }
  .vipc-sidebar { background: #12121a; border-right: 1px solid rgba(255,255,255,0.07); padding: 24px 16px; }
  .vipc-nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 10px; color: #c0c0d0; cursor: pointer; margin-bottom: 4px; font-size: 14px; transition: all 0.15s; }
  .vipc-nav-item:hover { background: rgba(255,255,255,0.03); }
  .vipc-nav-item.active { background: rgba(0,229,160,0.1); color: #00e5a0; }
  .vipc-content { padding: 32px; max-width: 900px; }
  .vipc-content h1 { font-family: 'Syne', sans-serif; font-size: 28px; margin-bottom: 8px; }
  .vipc-content > p { color: #6b6b8a; margin-bottom: 24px; }
  .vipc-card { background: #12121a; border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 24px; margin-bottom: 16px; }
  .vipc-stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; margin-bottom: 24px; }
  .vipc-stat { background: #12121a; border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 20px; }
  .vipc-stat-label { color: #6b6b8a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
  .vipc-stat-value { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; color: #00e5a0; margin-top: 6px; }
  .vipc-form-group { margin-bottom: 16px; }
  .vipc-form-group label { display: block; font-size: 13px; color: #6b6b8a; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
  .vipc-form-group input, .vipc-form-group textarea, .vipc-form-group select {
    width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px; padding: 12px 14px; color: #f0f0f8; font-size: 14px;
    outline: none; box-sizing: border-box; font-family: inherit;
  }
  .vipc-form-group textarea { min-height: 100px; resize: vertical; }
  .vipc-btn { padding: 10px 20px; background: linear-gradient(135deg, #00e5a0, #00b88a); color: #0a0a0f; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 14px; }
  .vipc-btn-danger { background: rgba(239, 68, 68, 0.15); color: #ef4444; padding: 6px 12px; font-size: 12px; border-radius: 8px; border: none; cursor: pointer; }
  .vipc-response-item { display: flex; justify-content: space-between; align-items: flex-start; padding: 14px; background: rgba(255,255,255,0.03); border-radius: 10px; margin-bottom: 10px; gap: 12px; }
  .vipc-response-trigger { font-weight: 700; color: #00e5a0; font-size: 13px; margin-bottom: 4px; }
  .vipc-response-text { color: #c0c0d0; font-size: 13px; line-height: 1.5; }
  .vipc-status-pill { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-left: 8px; }
  .vipc-status-pill.connected { background: rgba(0,229,160,0.15); color: #00e5a0; }
  .vipc-status-pill.disconnected { background: rgba(239,68,68,0.15); color: #ef4444; }
  .vipc-info { background: rgba(0, 229, 160, 0.06); border: 1px solid rgba(0, 229, 160, 0.2); padding: 16px; border-radius: 10px; font-size: 13px; color: #c0c0d0; line-height: 1.6; }
  .vipc-info code { background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 4px; color: #00e5a0; font-size: 12px; }
`;

const TABS = [
  { key: "dashboard", label: "📊 Dashboard", icon: "📊" },
  { key: "whatsapp", label: "📱 Conexión WhatsApp", icon: "📱" },
  { key: "responses", label: "💬 Respuestas Auto", icon: "💬" },
  { key: "templates", label: "📝 Plantillas IA", icon: "📝" },
  { key: "antiban", label: "🛡️ Anti-Baneo", icon: "🛡️" },
  { key: "settings", label: "⚙️ Configuración", icon: "⚙️" },
];

export default function Configuracion() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("dashboard");
  const [user, setUser] = useState(null);
  const [config, setConfig] = useState(null);
  const [stats, setStats] = useState(null);
  const [responses, setResponses] = useState([]);
  const [newResp, setNewResp] = useState({ trigger: "", response: "" });

  useEffect(() => {
    if (!getVipToken()) {
      navigate("/vip/checkout");
      return;
    }
    me().then(setUser).catch(() => {
      clearVipToken();
      navigate("/vip/checkout");
    });
    getBotConfig().then(setConfig).catch(() => {});
    getStats().then(setStats).catch(() => {});
    listResponses().then(setResponses).catch(() => {});
  }, [navigate]);

  const handleLogout = () => {
    clearVipToken();
    navigate("/");
  };

  const handleSaveConfig = async () => {
    try {
      await updateBotConfig(config);
      toast.success("Configuración guardada");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleAddResponse = async () => {
    if (!newResp.trigger.trim() || !newResp.response.trim()) {
      return toast.error("Completá ambos campos");
    }
    try {
      const created = await createResponse(newResp);
      setResponses([created, ...responses]);
      setNewResp({ trigger: "", response: "" });
      toast.success("Respuesta agregada");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteResponse = async (id) => {
    try {
      await deleteResponse(id);
      setResponses(responses.filter((r) => r.id !== id));
      toast.success("Eliminada");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="vipc">
      <style>{styles}</style>

      {/* HEADER */}
      <div className="vipc-header">
        <div className="vipc-logo">
          Vértice <span>VIP</span>
        </div>
        <div className="vipc-user">
          {user && (
            <>
              <span>{user.email}</span>
              <span className="vipc-status-pill" style={{ background: "rgba(0,229,160,0.15)", color: "#00e5a0" }}>
                Plan {user.plan?.toUpperCase()}
              </span>
            </>
          )}
          <button className="vipc-logout" onClick={handleLogout}>Salir</button>
        </div>
      </div>

      <div className="vipc-layout">
        {/* SIDEBAR */}
        <div className="vipc-sidebar">
          {TABS.map((t) => (
            <div
              key={t.key}
              className={`vipc-nav-item${tab === t.key ? " active" : ""}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </div>
          ))}
        </div>

        {/* CONTENT */}
        <div className="vipc-content">
          {tab === "dashboard" && (
            <>
              <h1>Dashboard</h1>
              <p>Resumen de la actividad de tu bot.</p>
              <div className="vipc-stat-grid">
                <div className="vipc-stat">
                  <div className="vipc-stat-label">Mensajes hoy</div>
                  <div className="vipc-stat-value">{stats?.today || 0}</div>
                </div>
                <div className="vipc-stat">
                  <div className="vipc-stat-label">Mensajes mes</div>
                  <div className="vipc-stat-value">{stats?.month || 0}</div>
                </div>
                <div className="vipc-stat">
                  <div className="vipc-stat-label">Respuestas auto</div>
                  <div className="vipc-stat-value">{responses.length}</div>
                </div>
                <div className="vipc-stat">
                  <div className="vipc-stat-label">Estado bot</div>
                  <div className="vipc-stat-value" style={{ fontSize: 18 }}>
                    {config?.connected ? "✓ Activo" : "⏸ Desconectado"}
                  </div>
                </div>
              </div>

              <div className="vipc-card">
                <h3 style={{ marginBottom: 12 }}>👋 Bienvenido a WhatsApp VIP</h3>
                <p style={{ color: "#c0c0d0", fontSize: 14, lineHeight: 1.6 }}>
                  Para empezar, conectá tu número de WhatsApp Business en la pestaña{" "}
                  <strong style={{ color: "#00e5a0" }}>📱 Conexión WhatsApp</strong>, después
                  configurá tus respuestas automáticas en{" "}
                  <strong style={{ color: "#00e5a0" }}>💬 Respuestas Auto</strong>.
                </p>
              </div>
            </>
          )}

          {tab === "whatsapp" && (
            <>
              <h1>
                Conexión WhatsApp
                <span className={`vipc-status-pill ${config?.connected ? "connected" : "disconnected"}`}>
                  {config?.connected ? "Conectado" : "No conectado"}
                </span>
              </h1>
              <p>Conectá tu cuenta WhatsApp Business Cloud API (oficial de Meta, gratis).</p>

              <div className="vipc-card">
                <div className="vipc-info" style={{ marginBottom: 20 }}>
                  💡 Necesitás crear una app en <code>developers.facebook.com</code> (gratis). Te
                  guiamos paso a paso si necesitás ayuda — escribinos a <code>+506 8751-8055</code>.
                </div>

                <div className="vipc-form-group">
                  <label>Número de teléfono ID (Phone Number ID)</label>
                  <input
                    value={config?.phone_id || ""}
                    onChange={(e) => setConfig({ ...config, phone_id: e.target.value })}
                    placeholder="123456789012345"
                  />
                </div>
                <div className="vipc-form-group">
                  <label>Access Token (Permanent)</label>
                  <input
                    type="password"
                    value={config?.access_token || ""}
                    onChange={(e) => setConfig({ ...config, access_token: e.target.value })}
                    placeholder="EAAxxx..."
                  />
                </div>
                <div className="vipc-form-group">
                  <label>Webhook Verify Token (cualquier string secreto)</label>
                  <input
                    value={config?.verify_token || ""}
                    onChange={(e) => setConfig({ ...config, verify_token: e.target.value })}
                    placeholder="mi_token_secreto_2026"
                  />
                </div>

                <button className="vipc-btn" onClick={handleSaveConfig}>
                  💾 Guardar y conectar
                </button>
              </div>
            </>
          )}

          {tab === "responses" && (
            <>
              <h1>Respuestas Automáticas</h1>
              <p>Cuando un cliente escriba estas palabras, el bot responde automático.</p>

              <div className="vipc-card">
                <h3 style={{ marginBottom: 16 }}>➕ Agregar nueva respuesta</h3>
                <div className="vipc-form-group">
                  <label>Cuando escriban (palabra o frase)</label>
                  <input
                    value={newResp.trigger}
                    onChange={(e) => setNewResp({ ...newResp, trigger: e.target.value })}
                    placeholder="Ej: precio, horario, ubicación..."
                  />
                </div>
                <div className="vipc-form-group">
                  <label>Respondé esto</label>
                  <textarea
                    value={newResp.response}
                    onChange={(e) => setNewResp({ ...newResp, response: e.target.value })}
                    placeholder="Hola! Nuestros precios son..."
                  />
                </div>
                <button className="vipc-btn" onClick={handleAddResponse}>
                  Agregar respuesta
                </button>
              </div>

              <h3 style={{ marginBottom: 12, marginTop: 24 }}>
                Respuestas activas ({responses.length})
              </h3>
              {responses.length === 0 ? (
                <p style={{ color: "#6b6b8a", fontSize: 14 }}>
                  Aún no tenés respuestas. Agregá la primera arriba.
                </p>
              ) : (
                responses.map((r) => (
                  <div key={r.id} className="vipc-response-item">
                    <div style={{ flex: 1 }}>
                      <div className="vipc-response-trigger">📌 {r.trigger}</div>
                      <div className="vipc-response-text">{r.response}</div>
                    </div>
                    <button className="vipc-btn-danger" onClick={() => handleDeleteResponse(r.id)}>
                      Eliminar
                    </button>
                  </div>
                ))
              )}
            </>
          )}

          {tab === "templates" && (
            <>
              <h1>Plantillas IA</h1>
              <p>Plantillas precargadas optimizadas con IA para diferentes industrias.</p>
              <div className="vipc-card">
                <p style={{ color: "#c0c0d0" }}>
                  🚧 Esta sección estará disponible pronto. Mientras tanto, podés copiar plantillas
                  manualmente desde nuestro WhatsApp <strong style={{ color: "#00e5a0" }}>+506 8751-8055</strong>
                </p>
              </div>
            </>
          )}

          {tab === "antiban" && (
            <>
              <h1>Anti-Baneo</h1>
              <p>Configuración de protección contra bloqueos de WhatsApp.</p>
              <div className="vipc-card">
                <div className="vipc-form-group">
                  <label>Delay entre mensajes (segundos)</label>
                  <input
                    type="number"
                    value={config?.message_delay || 3}
                    onChange={(e) => setConfig({ ...config, message_delay: parseInt(e.target.value) })}
                    min="2"
                    max="30"
                  />
                </div>
                <div className="vipc-form-group">
                  <label>Mensajes máximos por hora</label>
                  <input
                    type="number"
                    value={config?.max_per_hour || 60}
                    onChange={(e) => setConfig({ ...config, max_per_hour: parseInt(e.target.value) })}
                    min="10"
                    max="500"
                  />
                </div>
                <div className="vipc-form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={config?.rotate_messages || false}
                      onChange={(e) => setConfig({ ...config, rotate_messages: e.target.checked })}
                      style={{ width: "auto", marginRight: 8 }}
                    />
                    Rotar variaciones de mensajes (recomendado)
                  </label>
                </div>
                <button className="vipc-btn" onClick={handleSaveConfig}>Guardar</button>
              </div>
            </>
          )}

          {tab === "settings" && (
            <>
              <h1>Configuración General</h1>
              <p>Ajustes generales de tu bot.</p>
              <div className="vipc-card">
                <div className="vipc-form-group">
                  <label>Nombre del negocio</label>
                  <input
                    value={config?.business_name || ""}
                    onChange={(e) => setConfig({ ...config, business_name: e.target.value })}
                  />
                </div>
                <div className="vipc-form-group">
                  <label>Saludo inicial</label>
                  <textarea
                    value={config?.welcome_message || ""}
                    onChange={(e) => setConfig({ ...config, welcome_message: e.target.value })}
                    placeholder="¡Hola! Soy el asistente de [Negocio]. ¿En qué puedo ayudarte?"
                  />
                </div>
                <div className="vipc-form-group">
                  <label>Horario de atención</label>
                  <input
                    value={config?.business_hours || ""}
                    onChange={(e) => setConfig({ ...config, business_hours: e.target.value })}
                    placeholder="Lunes a viernes 8am-6pm"
                  />
                </div>
                <button className="vipc-btn" onClick={handleSaveConfig}>Guardar</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
