import React, { useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { createOrder, PLANS, PAYMENT_METHODS } from "../../lib/vipApi";

const styles = `
  .vip-checkout {
    min-height: 100vh;
    background: linear-gradient(180deg, #0a0a0f 0%, #14141f 100%);
    color: #f0f0f8;
    font-family: 'DM Sans', sans-serif;
    padding: 40px 20px;
  }
  .vip-checkout-container {
    max-width: 960px;
    margin: 0 auto;
  }
  .vip-checkout h1 {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: clamp(28px, 4vw, 40px);
    margin-bottom: 8px;
    background: linear-gradient(135deg, #00e5a0, #7b5ea7);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  .vip-checkout-subtitle {
    color: #6b6b8a;
    margin-bottom: 32px;
    font-size: 16px;
  }
  .vip-checkout-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }
  @media (max-width: 768px) {
    .vip-checkout-grid { grid-template-columns: 1fr; }
  }
  .vip-card {
    background: #12121a;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    padding: 28px;
  }
  .vip-card h2 {
    font-family: 'Syne', sans-serif;
    font-size: 20px;
    margin-bottom: 16px;
    color: #f0f0f8;
  }
  .vip-plan-summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: rgba(0,229,160,0.06);
    border: 1px solid rgba(0,229,160,0.2);
    border-radius: 12px;
    margin-bottom: 20px;
  }
  .vip-plan-name {
    font-weight: 700;
    font-size: 18px;
    color: #00e5a0;
  }
  .vip-plan-price {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 24px;
    color: #f0f0f8;
  }
  .vip-features {
    list-style: none;
    padding: 0;
    margin: 0 0 24px 0;
  }
  .vip-features li {
    padding: 10px 0;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    font-size: 14px;
    color: #c0c0d0;
  }
  .vip-features li:last-child { border: none; }
  .vip-features li::before {
    content: "✓";
    color: #00e5a0;
    margin-right: 10px;
    font-weight: 700;
  }
  .vip-form-group {
    margin-bottom: 16px;
  }
  .vip-form-group label {
    display: block;
    font-size: 13px;
    color: #6b6b8a;
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .vip-form-group input {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    padding: 12px 14px;
    color: #f0f0f8;
    font-size: 15px;
    outline: none;
    transition: border-color 0.2s;
    box-sizing: border-box;
  }
  .vip-form-group input:focus {
    border-color: #00e5a0;
  }
  .vip-method-options {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 24px;
  }
  .vip-method {
    display: flex;
    align-items: center;
    padding: 14px 16px;
    background: rgba(255,255,255,0.03);
    border: 2px solid rgba(255,255,255,0.07);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .vip-method:hover {
    border-color: rgba(0,229,160,0.4);
    background: rgba(0,229,160,0.05);
  }
  .vip-method.selected {
    border-color: #00e5a0;
    background: rgba(0,229,160,0.1);
  }
  .vip-method-icon {
    font-size: 28px;
    margin-right: 14px;
  }
  .vip-method-info { flex: 1; }
  .vip-method-name {
    font-weight: 600;
    font-size: 15px;
    color: #f0f0f8;
  }
  .vip-method-desc {
    font-size: 12px;
    color: #6b6b8a;
    margin-top: 2px;
  }
  .vip-method-badge {
    font-size: 10px;
    padding: 3px 8px;
    background: rgba(0,229,160,0.2);
    color: #00e5a0;
    border-radius: 999px;
    font-weight: 700;
    text-transform: uppercase;
  }
  .vip-cta {
    width: 100%;
    padding: 16px;
    background: linear-gradient(135deg, #00e5a0, #00b88a);
    color: #0a0a0f;
    border: none;
    border-radius: 12px;
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 16px;
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.2s;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .vip-cta:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 12px 28px rgba(0,229,160,0.3);
  }
  .vip-cta:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .vip-back {
    color: #6b6b8a;
    text-decoration: none;
    font-size: 14px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 24px;
  }
  .vip-back:hover { color: #00e5a0; }
  .vip-secure {
    text-align: center;
    margin-top: 20px;
    color: #6b6b8a;
    font-size: 12px;
  }
`;

export default function Checkout() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const planKey = params.get("plan") || "pro";
  const plan = PLANS[planKey] || PLANS.pro;

  const [method, setMethod] = useState("sinpe");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const planFeatures = useMemo(() => {
    const map = {
      starter: [
        "1 número de WhatsApp Business API",
        "Hasta 1.000 conversaciones/mes",
        "Plantillas IA precargadas",
        "Anti-baneo automático",
      ],
      pro: [
        "Todo del plan Básico",
        "Hasta 5.000 conversaciones/mes",
        "Modo Pánico + alertas en vivo",
        "Simulador de chat y ROI",
        "Configuración Cero Estrés",
      ],
      premium: [
        "Todo del plan Pro",
        "Conversaciones ilimitadas",
        "Multi-sucursal / multi-agente",
        "Integración n8n + CRM",
        "Soporte prioritario 24/7",
      ],
    };
    return map[planKey] || map.pro;
  }, [planKey]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return toast.error("Email es requerido");
    if (!phone.trim()) return toast.error("WhatsApp es requerido");

    setLoading(true);
    try {
      const order = await createOrder({
        plan: planKey,
        method,
        email: email.trim(),
        phone: phone.trim(),
      });
      toast.success("Orden creada");
      navigate(`/vip/pago/${method}/${order.id}`);
    } catch (err) {
      toast.error(err.message || "Error al crear orden");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vip-checkout">
      <style>{styles}</style>
      <div className="vip-checkout-container">
        <a href="/" className="vip-back">← Volver al sitio</a>

        <h1>Activar WhatsApp VIP</h1>
        <p className="vip-checkout-subtitle">
          Empezá a automatizar tu atención al cliente en menos de 24 horas.
        </p>

        <div className="vip-checkout-grid">
          {/* RESUMEN DE PLAN */}
          <div className="vip-card">
            <h2>📦 Resumen del plan</h2>
            <div className="vip-plan-summary">
              <span className="vip-plan-name">Plan {plan.name}</span>
              <span className="vip-plan-price">${plan.price}/{plan.period}</span>
            </div>
            <ul className="vip-features">
              {planFeatures.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
            <div style={{ fontSize: 12, color: "#6b6b8a", marginTop: 12 }}>
              Sin contratos. Cancelá cuando quieras.
            </div>
          </div>

          {/* FORMULARIO DE PAGO */}
          <form className="vip-card" onSubmit={handleSubmit}>
            <h2>💳 Datos y método de pago</h2>

            <div className="vip-form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
              />
            </div>

            <div className="vip-form-group">
              <label>WhatsApp del negocio</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+506 8888-8888"
                required
              />
            </div>

            <label style={{ fontSize: 13, color: "#6b6b8a", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8, display: "block" }}>
              Método de pago
            </label>
            <div className="vip-method-options">
              {Object.entries(PAYMENT_METHODS).map(([key, m]) => (
                <div
                  key={key}
                  className={`vip-method${method === key ? " selected" : ""}`}
                  onClick={() => setMethod(key)}
                >
                  <span className="vip-method-icon">{m.icon}</span>
                  <div className="vip-method-info">
                    <div className="vip-method-name">{m.name}</div>
                    <div className="vip-method-desc">{m.description}</div>
                  </div>
                  {m.instant && <span className="vip-method-badge">Instantáneo</span>}
                </div>
              ))}
            </div>

            <button className="vip-cta" disabled={loading} type="submit">
              {loading ? "Procesando..." : `Continuar · $${plan.price}`}
            </button>
            <div className="vip-secure">🔒 Pago seguro · Sin Stripe · Sin tarjetas guardadas</div>
          </form>
        </div>
      </div>
    </div>
  );
}
