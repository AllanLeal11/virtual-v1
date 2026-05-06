import React, { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

const BACKEND = process.env.REACT_APP_BACKEND_URL || "";
const API = `${BACKEND}/api/vip/admin`;

const styles = `
  .vipa { min-height: 100vh; background: #0a0a0f; color: #f0f0f8; font-family: 'DM Sans', sans-serif; padding: 40px 24px; }
  .vipa-container { max-width: 1100px; margin: 0 auto; }
  .vipa-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; flex-wrap: wrap; gap: 16px; }
  .vipa-header h1 { font-family: 'Syne', sans-serif; font-size: 28px; }
  .vipa-tabs { display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
  .vipa-tab { padding: 10px 16px; background: #12121a; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; color: #c0c0d0; cursor: pointer; font-size: 13px; }
  .vipa-tab.active { background: rgba(0,229,160,0.1); border-color: #00e5a0; color: #00e5a0; }
  .vipa-tab-count { display: inline-block; margin-left: 8px; padding: 2px 8px; background: rgba(255,255,255,0.1); border-radius: 999px; font-size: 11px; font-weight: 700; }
  .vipa-tab.active .vipa-tab-count { background: rgba(0,229,160,0.25); color: #00e5a0; }
  .vipa-card { background: #12121a; border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 20px; margin-bottom: 12px; }
  .vipa-card-row { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr auto; gap: 16px; align-items: center; }
  @media (max-width: 768px) { .vipa-card-row { grid-template-columns: 1fr 1fr; gap: 10px; } }
  .vipa-field-label { font-size: 11px; color: #6b6b8a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
  .vipa-field-value { font-size: 14px; color: #f0f0f8; font-weight: 500; word-break: break-all; }
  .vipa-amount { font-family: 'Syne', sans-serif; font-weight: 800; color: #00e5a0; font-size: 20px; }
  .vipa-status { padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; display: inline-block; }
  .vipa-status.pending { background: rgba(251, 191, 36, 0.15); color: #fbbf24; }
  .vipa-status.processing { background: rgba(99, 102, 241, 0.15); color: #818cf8; }
  .vipa-status.paid { background: rgba(0,229,160,0.15); color: #00e5a0; }
  .vipa-status.cancelled { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
  .vipa-actions { display: flex; gap: 8px; }
  .vipa-btn { padding: 10px 16px; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 700; transition: transform 0.1s; }
  .vipa-btn:hover { transform: translateY(-1px); }
  .vipa-btn-approve { background: linear-gradient(135deg, #00e5a0, #00b88a); color: #0a0a0f; }
  .vipa-btn-reject { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
  .vipa-btn-copy { background: rgba(255,255,255,0.05); color: #c0c0d0; padding: 6px 12px; font-size: 11px; border: 1px solid rgba(255,255,255,0.08); }
  .vipa-empty { text-align: center; padding: 60px 20px; color: #6b6b8a; }
  .vipa-empty-icon { font-size: 56px; margin-bottom: 16px; opacity: 0.3; }
  .vipa-token-input { width: 100%; max-width: 400px; padding: 12px 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #f0f0f8; font-size: 14px; outline: none; box-sizing: border-box; font-family: monospace; }
  .vipa-magic-link { background: rgba(0,229,160,0.06); border: 1px solid rgba(0,229,160,0.2); padding: 14px; border-radius: 10px; margin-top: 12px; word-break: break-all; font-family: monospace; font-size: 12px; color: #00e5a0; cursor: pointer; }
  .vipa-extra { margin-top: 14px; padding: 12px; background: rgba(255,255,255,0.02); border-radius: 8px; font-size: 12px; color: #6b6b8a; }
  .vipa-refresh { background: rgba(0,229,160,0.1); border: 1px solid rgba(0,229,160,0.3); color: #00e5a0; padding: 10px 16px; border-radius: 10px; cursor: pointer; font-size: 13px; }
`;

export default function AdminVip() {
  const [adminToken, setAdminToken] = useState(localStorage.getItem("vd_admin_vip_token") || "");
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState("processing");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [magicLinks, setMagicLinks] = useState({});

  const fetchOrders = useCallback(async () => {
    if (!adminToken) return;
    setLoading(true);
    try {
      const status = tab === "all" ? "" : tab;
      const url = `${API}/orders${status ? `?status=${status}` : ""}`;
      const r = await fetch(url, { headers: { "X-Admin-Token": adminToken } });
      if (r.status === 401) {
        toast.error("Token de admin inválido");
        setAuthed(false);
        localStorage.removeItem("vd_admin_vip_token");
        return;
      }
      const data = await r.json();
      setOrders(Array.isArray(data) ? data : []);
      setAuthed(true);
    } catch (err) {
      toast.error("Error al cargar órdenes");
    } finally {
      setLoading(false);
    }
  }, [adminToken, tab]);

  useEffect(() => {
    if (adminToken) fetchOrders();
  }, [adminToken, tab, fetchOrders]);

  // Auto-refresh cada 30s
  useEffect(() => {
    if (!authed) return;
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [authed, fetchOrders]);

  const saveToken = (t) => {
    localStorage.setItem("vd_admin_vip_token", t);
    setAdminToken(t);
  };

  const approve = async (orderId) => {
    if (!confirm("¿Aprobar este pago y activar al cliente?")) return;
    try {
      const r = await fetch(`${API}/orders/${orderId}/approve`, {
        method: "POST",
        headers: { "X-Admin-Token": adminToken },
      });
      if (!r.ok) throw new Error(await r.text());
      const data = await r.json();
      toast.success("✓ Cliente activado");
      setMagicLinks({ ...magicLinks, [orderId]: data });
      fetchOrders();
    } catch (err) {
      toast.error("Error: " + err.message);
    }
  };

  const reject = async (orderId) => {
    const reason = prompt("Motivo del rechazo (opcional):") || "";
    try {
      const fd = new FormData();
      fd.append("reason", reason);
      await fetch(`${API}/orders/${orderId}/reject`, {
        method: "POST",
        headers: { "X-Admin-Token": adminToken },
        body: fd,
      });
      toast.success("Orden rechazada");
      fetchOrders();
    } catch (err) {
      toast.error("Error: " + err.message);
    }
  };

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado");
  };

  const sendWhatsapp = (link, order) => {
    const baseUrl = window.location.origin;
    const fullLink = `${baseUrl}${link}`;
    const text = encodeURIComponent(
      `¡Tu acceso a WhatsApp VIP está activo! 🎉\n\n` +
      `Plan: ${order.plan?.toUpperCase()}\n\n` +
      `Configurá tu bot acá:\n${fullLink}\n\n` +
      `Si necesitás ayuda, escribime.`
    );
    const phone = (order.phone || "").replace(/\D/g, "");
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  };

  // ============== LOGIN ==============
  if (!authed) {
    return (
      <div className="vipa">
        <style>{styles}</style>
        <div className="vipa-container" style={{ maxWidth: 480 }}>
          <h1>🔐 Admin WhatsApp VIP</h1>
          <p style={{ color: "#6b6b8a", margin: "12px 0 24px" }}>
            Ingresá tu token de admin (variable VIP_ADMIN_TOKEN del backend).
          </p>
          <div className="vipa-card">
            <input
              type="password"
              className="vipa-token-input"
              placeholder="VIP_ADMIN_TOKEN"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.target.value.trim()) saveToken(e.target.value.trim());
              }}
            />
            <p style={{ fontSize: 12, color: "#6b6b8a", marginTop: 12 }}>
              Presioná Enter para entrar
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ============== DASHBOARD ==============
  const tabs = [
    { key: "processing", label: "🟡 Por aprobar" },
    { key: "paid", label: "✅ Activos" },
    { key: "pending", label: "⏳ Sin pagar" },
    { key: "cancelled", label: "❌ Rechazados" },
    { key: "all", label: "📋 Todos" },
  ];

  return (
    <div className="vipa">
      <style>{styles}</style>
      <div className="vipa-container">
        <div className="vipa-header">
          <h1>WhatsApp VIP · Admin</h1>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#6b6b8a" }}>Auto-refresh 30s</span>
            <button className="vipa-refresh" onClick={fetchOrders}>
              🔄 Refrescar
            </button>
          </div>
        </div>

        <div className="vipa-tabs">
          {tabs.map((t) => (
            <div
              key={t.key}
              className={`vipa-tab${tab === t.key ? " active" : ""}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              {tab === t.key && <span className="vipa-tab-count">{orders.length}</span>}
            </div>
          ))}
        </div>

        {loading && <p style={{ color: "#6b6b8a" }}>Cargando…</p>}

        {!loading && orders.length === 0 && (
          <div className="vipa-empty">
            <div className="vipa-empty-icon">📭</div>
            <p>No hay órdenes en este estado.</p>
          </div>
        )}

        {orders.map((o) => {
          const magicData = magicLinks[o.id];
          return (
            <div key={o.id} className="vipa-card">
              <div className="vipa-card-row">
                <div>
                  <div className="vipa-field-label">Plan</div>
                  <div className="vipa-field-value">{o.plan?.toUpperCase()}</div>
                </div>
                <div>
                  <div className="vipa-field-label">Monto</div>
                  <div className="vipa-amount">${o.amount_usd}</div>
                  <div style={{ fontSize: 11, color: "#6b6b8a", marginTop: 2 }}>
                    ₡{o.amount_crc?.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="vipa-field-label">Cliente</div>
                  <div className="vipa-field-value">{o.email}</div>
                  <div style={{ fontSize: 12, color: "#c0c0d0", marginTop: 2 }}>{o.phone}</div>
                </div>
                <div>
                  <div className="vipa-field-label">Estado</div>
                  <span className={`vipa-status ${o.status}`}>{o.status}</span>
                  <div style={{ fontSize: 11, color: "#6b6b8a", marginTop: 6 }}>
                    {o.method?.toUpperCase()}
                  </div>
                </div>
                <div className="vipa-actions">
                  {o.status === "processing" && (
                    <>
                      <button className="vipa-btn vipa-btn-approve" onClick={() => approve(o.id)}>
                        ✓ Aprobar
                      </button>
                      <button className="vipa-btn vipa-btn-reject" onClick={() => reject(o.id)}>
                        ✕
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="vipa-extra">
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  <span><strong>ID:</strong> VIP-{o.id?.slice(-6)}</span>
                  {o.sinpe_reference && (
                    <span>
                      <strong>SINPE ref:</strong> {o.sinpe_reference}
                      <button className="vipa-btn vipa-btn-copy" onClick={() => copy(o.sinpe_reference)} style={{ marginLeft: 6 }}>📋</button>
                    </span>
                  )}
                  {o.tx_hash && (
                    <span>
                      <strong>TX hash:</strong> {o.tx_hash.slice(0, 20)}...
                      <button className="vipa-btn vipa-btn-copy" onClick={() => copy(o.tx_hash)} style={{ marginLeft: 6 }}>📋</button>
                    </span>
                  )}
                  <span><strong>Creado:</strong> {new Date(o.created_at).toLocaleString("es-CR")}</span>
                </div>
              </div>

              {magicData && (
                <div>
                  <div className="vipa-magic-link" onClick={() => copy(`${window.location.origin}${magicData.magic_link}`)}>
                    🪄 {window.location.origin}{magicData.magic_link} (click para copiar)
                  </div>
                  <button className="vipa-btn vipa-btn-approve" onClick={() => sendWhatsapp(magicData.magic_link, o)} style={{ marginTop: 10 }}>
                    📱 Enviar al WhatsApp del cliente
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
