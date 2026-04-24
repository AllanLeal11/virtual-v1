import React, { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SERVICES = [
  { key: "Sitios Web", icon: "🌐", name: "Sitios Web", desc: "Diseño y desarrollo de páginas web profesionales, responsivas y optimizadas para SEO.", priceLabel: "₡150,000 – ₡600,000", min: 150000, max: 600000, features: ["Diseño personalizado", "Responsive", "SEO optimizado", "Panel admin"] },
  { key: "Guanacaste Concierge", icon: "🏨", name: "Concierge AI", desc: "Asistente inteligente para hoteles que gestiona reservas y dudas de huéspedes 24/7.", priceLabel: "Suscripción", min: 0, max: null, quote: true, features: ["FastAPI + OpenAI", "Integración Web", "Multilingüe", "Panel de control"] },
  { key: "WhatsApp Bot", icon: "💬", name: "WhatsApp Bot", desc: "Automatiza tu atención al cliente con bots inteligentes para WhatsApp Business.", priceLabel: "₡200,000", min: 200000, max: null, features: ["Respuestas automáticas", "Catálogo de productos", "Atención 24/7", "Integración WhatsApp Business"] },
  { key: "AirBnB Hub", icon: "🏠", name: "AirBnB Automation", desc: "Automatización total para anfitriones. Gestión de check-ins, guías digitales inteligentes y comunicación automática con huéspedes.", priceLabel: "Consultar", min: 0, max: null, quote: true, features: ["Check-in digital", "Guías interactivas", "Sync con calendarios", "IA Concierge"] },
  { key: "E-commerce Pro", icon: "🛍️", name: "E-commerce Local", desc: "Lleve sus productos de Guanacaste a todo el mundo. Tiendas online rápidas, seguras y optimizadas para móviles.", priceLabel: "Desde ₡250,000", min: 250000, max: null, features: ["Pagos con tarjeta/SINPE", "Gestión de inventario", "SEO para productos", "Diseño Premium"] },
  { key: "Sistema POS", icon: "🛒", name: "Sistema POS", desc: "Punto de venta moderno para gestionar tu negocio de forma eficiente.", priceLabel: "₡400,000", min: 400000, max: null, features: ["Inventario", "Ventas", "Reportes", "Multi-sucursal"] },
  { key: "Automatizaciones", icon: "⚡", name: "Automatizaciones", desc: "Optimiza tus procesos con flujos automatizados y conexiones entre sistemas.", priceLabel: "Cotización", min: 0, max: null, quote: true, features: ["n8n workflows", "Integraciones API", "Notificaciones", "Reportes auto"] },
];

// URL pública del producto WhatsApp VIP Business (SaaS independiente).
// Cambia esta variable o define REACT_APP_VIP_URL en Railway para apuntar a tu dominio final.
const VIP_APP_URL =
  process.env.REACT_APP_VIP_URL || "https://whatsapp-vip-business.replit.app";

const VIP_PLANS = [
  {
    key: "starter",
    name: "Básico",
    price: "$29",
    period: "/mes",
    tagline: "Para arrancar y probar el bot oficial.",
    features: [
      "1 número WhatsApp Business API",
      "Hasta 1.000 conversaciones/mes",
      "Plantillas IA precargadas",
      "Anti-baneo automático",
    ],
    cta: "Empezar Básico",
  },
  {
    key: "pro",
    name: "Pro",
    price: "$59",
    period: "/mes",
    tagline: "El más elegido por restaurantes y hoteles.",
    popular: true,
    features: [
      "Todo lo del plan Básico",
      "Hasta 5.000 conversaciones/mes",
      "Modo Pánico + alertas en vivo",
      "Simulador de chat y ROI",
      "Configuración Cero Estrés",
    ],
    cta: "Activar Pro",
  },
  {
    key: "premium",
    name: "Premium",
    price: "$149",
    period: "/mes",
    tagline: "Para operaciones serias y multi-sucursal.",
    features: [
      "Todo lo del plan Pro",
      "Conversaciones ilimitadas",
      "Multi-sucursal / multi-agente",
      "Integración n8n + CRM",
      "Soporte prioritario 24/7",
    ],
    cta: "Activar Premium",
  },
];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  :root {
    --bg: #0a0a0f;
    --surface: #12121a;
    --surface2: #1a1a26;
    --border: rgba(255,255,255,0.07);
    --accent: #00e5a0;
    --accent2: #7b5ea7;
    --text: #f0f0f8;
    --muted: #6b6b8a;
    --card-hover: #1e1e2e;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .vd-wrap {
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* NAV */
  .vd-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.2rem 2.5rem;
    border-bottom: 1px solid var(--border);
    position: sticky;
    top: 0;
    background: rgba(10,10,15,0.85);
    backdrop-filter: blur(14px);
    z-index: 100;
  }
  .vd-logo {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1.35rem;
    letter-spacing: -0.02em;
    color: var(--text);
  }
  .vd-logo span { color: var(--accent); }
  .vd-nav-cta {
    background: var(--accent);
    color: #0a0a0f;
    border: none;
    padding: 0.55rem 1.4rem;
    border-radius: 100px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    font-size: 0.9rem;
    cursor: pointer;
    transition: opacity 0.2s;
  }
  .vd-nav-cta:hover { opacity: 0.85; }

  /* HERO */
  .vd-hero {
    padding: 6rem 2.5rem 5rem;
    max-width: 900px;
    margin: 0 auto;
    text-align: center;
    position: relative;
  }
  .vd-hero::before {
    content: '';
    position: absolute;
    top: 0; left: 50%;
    transform: translateX(-50%);
    width: 600px; height: 400px;
    background: radial-gradient(ellipse at center, rgba(0,229,160,0.08) 0%, transparent 70%);
    pointer-events: none;
  }
  .vd-badge {
    display: inline-block;
    background: rgba(0,229,160,0.1);
    border: 1px solid rgba(0,229,160,0.25);
    color: var(--accent);
    font-size: 0.78rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 0.35rem 1rem;
    border-radius: 100px;
    margin-bottom: 1.8rem;
  }
  .vd-hero h1 {
    font-family: 'Syne', sans-serif;
    font-size: clamp(2.4rem, 6vw, 4.2rem);
    font-weight: 800;
    line-height: 1.1;
    letter-spacing: -0.03em;
    margin-bottom: 1.4rem;
  }
  .vd-hero h1 em {
    font-style: normal;
    color: var(--accent);
  }
  .vd-hero p {
    font-size: 1.1rem;
    color: var(--muted);
    line-height: 1.7;
    max-width: 580px;
    margin: 0 auto 2.5rem;
  }
  .vd-hero-btns {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }
  .vd-btn-primary {
    background: var(--accent);
    color: #0a0a0f;
    border: none;
    padding: 0.75rem 2rem;
    border-radius: 100px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.2s;
  }
  .vd-btn-primary:hover { opacity: 0.85; transform: translateY(-1px); }
  .vd-btn-secondary {
    background: transparent;
    color: var(--text);
    border: 1px solid var(--border);
    padding: 0.75rem 2rem;
    border-radius: 100px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    font-size: 0.95rem;
    cursor: pointer;
    transition: border-color 0.2s, transform 0.2s;
  }
  .vd-btn-secondary:hover { border-color: rgba(255,255,255,0.25); transform: translateY(-1px); }

  /* STATS */
  .vd-stats {
    display: flex;
    justify-content: center;
    gap: 3rem;
    padding: 2.5rem 2.5rem 4rem;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    flex-wrap: wrap;
  }
  .vd-stat { text-align: center; }
  .vd-stat-num {
    font-family: 'Syne', sans-serif;
    font-size: 2rem;
    font-weight: 800;
    color: var(--accent);
    display: block;
  }
  .vd-stat-label {
    font-size: 0.85rem;
    color: var(--muted);
    margin-top: 0.2rem;
  }

  /* SERVICES */
  .vd-section {
    padding: 5rem 2.5rem;
    max-width: 1200px;
    margin: 0 auto;
  }
  .vd-section-label {
    font-size: 0.78rem;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 0.8rem;
  }
  .vd-section-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(1.8rem, 4vw, 2.8rem);
    font-weight: 800;
    letter-spacing: -0.02em;
    margin-bottom: 0.8rem;
  }
  .vd-section-sub {
    color: var(--muted);
    font-size: 1rem;
    margin-bottom: 3rem;
    max-width: 500px;
  }

  .vd-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.2rem;
  }

  .vd-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 1.8rem;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s, transform 0.2s;
    position: relative;
    overflow: hidden;
  }
  .vd-card:hover {
    background: var(--card-hover);
    border-color: rgba(0,229,160,0.2);
    transform: translateY(-2px);
  }
  .vd-card.selected {
    border-color: var(--accent);
    background: rgba(0,229,160,0.05);
  }
  .vd-card-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }
  .vd-card-icon {
    font-size: 2rem;
    line-height: 1;
  }
  .vd-card-price {
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--accent);
    background: rgba(0,229,160,0.1);
    border: 1px solid rgba(0,229,160,0.2);
    padding: 0.25rem 0.7rem;
    border-radius: 100px;
    white-space: nowrap;
  }
  .vd-card h3 {
    font-family: 'Syne', sans-serif;
    font-size: 1.15rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }
  .vd-card p {
    font-size: 0.88rem;
    color: var(--muted);
    line-height: 1.6;
    margin-bottom: 1.2rem;
  }
  .vd-features {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }
  .vd-feature-tag {
    font-size: 0.75rem;
    color: rgba(240,240,248,0.6);
    background: rgba(255,255,255,0.05);
    border: 1px solid var(--border);
    padding: 0.2rem 0.6rem;
    border-radius: 100px;
  }
  .vd-check {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 22px;
    height: 22px;
    background: var(--accent);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    color: #0a0a0f;
    font-weight: 700;
  }

  /* CONTACT FORM */
  .vd-form-wrap {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 2.5rem;
    max-width: 680px;
    margin: 0 auto;
  }
  .vd-form-title {
    font-family: 'Syne', sans-serif;
    font-size: 1.5rem;
    font-weight: 800;
    margin-bottom: 0.4rem;
  }
  .vd-form-sub {
    color: var(--muted);
    font-size: 0.9rem;
    margin-bottom: 2rem;
  }
  .vd-selected-services {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }
  .vd-selected-tag {
    background: rgba(0,229,160,0.1);
    border: 1px solid rgba(0,229,160,0.3);
    color: var(--accent);
    font-size: 0.8rem;
    padding: 0.3rem 0.8rem;
    border-radius: 100px;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }
  .vd-selected-tag button {
    background: none;
    border: none;
    color: var(--accent);
    cursor: pointer;
    font-size: 0.9rem;
    line-height: 1;
    padding: 0;
    opacity: 0.6;
  }
  .vd-selected-tag button:hover { opacity: 1; }
  .vd-form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  @media (max-width: 560px) {
    .vd-form-row { grid-template-columns: 1fr; }
  }
  .vd-field {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }
  .vd-field label {
    font-size: 0.82rem;
    color: var(--muted);
    font-weight: 500;
  }
  .vd-field input,
  .vd-field textarea,
  .vd-field select {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 0.7rem 1rem;
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    outline: none;
    transition: border-color 0.2s;
    width: 100%;
  }
  .vd-field input:focus,
  .vd-field textarea:focus,
  .vd-field select:focus {
    border-color: rgba(0,229,160,0.4);
  }
  .vd-field textarea { resize: vertical; min-height: 100px; }
  .vd-field select option { background: var(--surface2); }
  .vd-submit {
    width: 100%;
    background: var(--accent);
    color: #0a0a0f;
    border: none;
    padding: 0.85rem;
    border-radius: 12px;
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    margin-top: 1rem;
    transition: opacity 0.2s, transform 0.2s;
  }
  .vd-submit:hover:not(:disabled) { opacity: 0.85; transform: translateY(-1px); }
  .vd-submit:disabled { opacity: 0.5; cursor: not-allowed; }

  /* FOOTER */
  .vd-footer {
    border-top: 1px solid var(--border);
    padding: 2.5rem;
    text-align: center;
    color: var(--muted);
    font-size: 0.85rem;
  }
  .vd-footer strong { color: var(--text); font-family: 'Syne', sans-serif; }

  /* WHATSAPP VIP SECTION */
  .vd-vip {
    padding: 5rem 2.5rem;
    max-width: 1200px;
    margin: 0 auto;
    position: relative;
  }
  .vd-vip::before {
    content: '';
    position: absolute;
    top: 10%; left: 50%;
    transform: translateX(-50%);
    width: 800px; height: 500px;
    background: radial-gradient(ellipse at center, rgba(0,229,160,0.06) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }
  .vd-vip-head {
    text-align: center;
    position: relative;
    z-index: 1;
    margin-bottom: 3rem;
  }
  .vd-vip-eyebrow {
    display: inline-block;
    background: rgba(0,229,160,0.1);
    border: 1px solid rgba(0,229,160,0.3);
    color: var(--accent);
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 0.4rem 1.1rem;
    border-radius: 100px;
    margin-bottom: 1.4rem;
  }
  .vd-vip-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(2rem, 5vw, 3.4rem);
    font-weight: 800;
    letter-spacing: -0.03em;
    line-height: 1.1;
    margin-bottom: 1rem;
  }
  .vd-vip-title em {
    font-style: normal;
    color: var(--accent);
  }
  .vd-vip-sub {
    color: var(--muted);
    font-size: 1.05rem;
    line-height: 1.7;
    max-width: 620px;
    margin: 0 auto 1.8rem;
  }
  .vd-vip-pills {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.6rem;
  }
  .vd-vip-pill {
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text);
    font-size: 0.82rem;
    font-weight: 500;
    padding: 0.4rem 0.9rem;
    border-radius: 100px;
  }
  .vd-vip-pill em {
    color: var(--accent);
    font-style: normal;
    margin-right: 0.35rem;
  }
  .vd-vip-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.2rem;
    position: relative;
    z-index: 1;
    margin-bottom: 2.5rem;
  }
  .vd-vip-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 2rem 1.8rem;
    display: flex;
    flex-direction: column;
    transition: background 0.2s, border-color 0.2s, transform 0.2s;
    position: relative;
  }
  .vd-vip-card:hover {
    background: var(--card-hover);
    border-color: rgba(0,229,160,0.25);
    transform: translateY(-3px);
  }
  .vd-vip-card.popular {
    border-color: rgba(0,229,160,0.5);
    background: linear-gradient(180deg, rgba(0,229,160,0.05) 0%, var(--surface) 60%);
  }
  .vd-vip-badge {
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--accent);
    color: #0a0a0f;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 0.3rem 0.9rem;
    border-radius: 100px;
  }
  .vd-vip-plan-name {
    font-family: 'Syne', sans-serif;
    font-size: 1.2rem;
    font-weight: 700;
    margin-bottom: 0.4rem;
  }
  .vd-vip-plan-tag {
    font-size: 0.85rem;
    color: var(--muted);
    margin-bottom: 1.4rem;
    line-height: 1.5;
  }
  .vd-vip-price-row {
    display: flex;
    align-items: baseline;
    gap: 0.3rem;
    margin-bottom: 1.6rem;
  }
  .vd-vip-price {
    font-family: 'Syne', sans-serif;
    font-size: 2.6rem;
    font-weight: 800;
    color: var(--accent);
    line-height: 1;
  }
  .vd-vip-period {
    color: var(--muted);
    font-size: 0.95rem;
  }
  .vd-vip-feats {
    list-style: none;
    margin: 0 0 1.8rem 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
    flex: 1;
  }
  .vd-vip-feats li {
    color: var(--text);
    font-size: 0.9rem;
    line-height: 1.5;
    display: flex;
    align-items: flex-start;
    gap: 0.55rem;
  }
  .vd-vip-feats li::before {
    content: '✓';
    color: var(--accent);
    font-weight: 700;
    flex-shrink: 0;
    margin-top: 1px;
  }
  .vd-vip-card-cta {
    background: var(--accent);
    color: #0a0a0f;
    border: none;
    padding: 0.8rem 1.4rem;
    border-radius: 100px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    text-decoration: none;
    text-align: center;
    transition: opacity 0.2s, transform 0.2s;
  }
  .vd-vip-card-cta:hover { opacity: 0.85; transform: translateY(-1px); }
  .vd-vip-card-cta.outline {
    background: transparent;
    color: var(--text);
    border: 1px solid var(--border);
  }
  .vd-vip-card-cta.outline:hover {
    border-color: rgba(0,229,160,0.4);
  }
  .vd-vip-foot {
    text-align: center;
    position: relative;
    z-index: 1;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.8rem;
  }

  /* SCROLL REVEAL */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .vd-card { animation: fadeUp 0.4s ease both; }
  .vd-vip-card { animation: fadeUp 0.5s ease both; }
  ${SERVICES.map((_, i) => `.vd-card:nth-child(${i + 1}) { animation-delay: ${i * 0.05}s; }`).join('\n  ')}

  @media (max-width: 640px) {
    .vd-nav { padding: 1rem 1.2rem; }
    .vd-hero { padding: 4rem 1.2rem 3rem; }
    .vd-section { padding: 3rem 1.2rem; }
    .vd-stats { gap: 2rem; padding: 2rem 1.2rem; }
    .vd-form-wrap { padding: 1.5rem; }
  }
`;

const LandingPage = () => {
  const [selected, setSelected] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", phone: "", budget: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);

  const toggleService = (key) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const scrollToForm = () => {
    setFormVisible(true);
    setTimeout(() => {
      document.getElementById("vd-contact")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast.error("Por favor ingresa tu nombre y correo.");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/contact`, {
        ...form,
        services: selected,
      });
      toast.success("¡Mensaje enviado! Te contactaremos pronto.");
      setForm({ name: "", email: "", phone: "", budget: "", message: "" });
      setSelected([]);
    } catch (err) {
      toast.error("Error al enviar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="vd-wrap">

        {/* NAV */}
        <nav className="vd-nav">
          <div className="vd-logo">Vertice<span>.</span>Digital</div>
          <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
            <button
              className="vd-btn-secondary"
              style={{ padding: "0.5rem 1.1rem", fontSize: "0.85rem" }}
              onClick={() => document.getElementById("vd-whatsapp-vip")?.scrollIntoView({ behavior: "smooth" })}
              data-testid="nav-vip"
            >
              WhatsApp VIP
            </button>
            <button className="vd-nav-cta" onClick={scrollToForm}>Cotizar proyecto</button>
          </div>
        </nav>

        {/* HERO */}
        <section className="vd-hero">
          <div className="vd-badge">🇨🇷 Guanacaste · Costa Rica</div>
          <h1>
            Tecnología que hace<br />
            crecer tu <em>negocio</em>
          </h1>
          <p>
            Desarrollo web, automatizaciones con IA y soluciones digitales a medida
            para empresas en Guanacaste y toda Costa Rica.
          </p>
          <div className="vd-hero-btns">
            <button className="vd-btn-primary" onClick={scrollToForm}>Ver servicios y cotizar</button>
            <button className="vd-btn-secondary" onClick={() => document.getElementById("vd-services")?.scrollIntoView({ behavior: "smooth" })}>
              Conocer más
            </button>
          </div>
        </section>

        {/* STATS */}
        <div className="vd-stats">
          {[
            { num: "50+", label: "Proyectos entregados" },
            { num: "7", label: "Servicios disponibles" },
            { num: "24/7", label: "Soporte con IA" },
            { num: "100%", label: "Clientes satisfechos" },
          ].map((s) => (
            <div key={s.num} className="vd-stat">
              <span className="vd-stat-num">{s.num}</span>
              <div className="vd-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* WHATSAPP VIP BUSINESS — sección destacada */}
        <section className="vd-vip" id="vd-whatsapp-vip">
          <div className="vd-vip-head">
            <div className="vd-vip-eyebrow">⭐ Producto Premium · IA</div>
            <h2 className="vd-vip-title">
              WhatsApp <em>VIP Business</em>
            </h2>
            <p className="vd-vip-sub">
              El asistente oficial de WhatsApp con IA que vende, agenda y atiende
              por ti — sin baneos, sin estrés, en español. Activación guiada,
              modo pánico y simulador de conversaciones incluidos.
            </p>
            <div className="vd-vip-pills">
              <div className="vd-vip-pill"><em>✓</em>Anti-baneo oficial</div>
              <div className="vd-vip-pill"><em>✓</em>IA 24/7 en español</div>
              <div className="vd-vip-pill"><em>✓</em>Setup Cero Estrés</div>
              <div className="vd-vip-pill"><em>✓</em>Modo Pánico</div>
            </div>
          </div>

          <div className="vd-vip-grid">
            {VIP_PLANS.map((plan) => (
              <div
                key={plan.key}
                className={`vd-vip-card${plan.popular ? " popular" : ""}`}
                data-testid={`vip-plan-${plan.key}`}
              >
                {plan.popular && <div className="vd-vip-badge">Más popular</div>}
                <div className="vd-vip-plan-name">{plan.name}</div>
                <div className="vd-vip-plan-tag">{plan.tagline}</div>
                <div className="vd-vip-price-row">
                  <span className="vd-vip-price">{plan.price}</span>
                  <span className="vd-vip-period">{plan.period}</span>
                </div>
                <ul className="vd-vip-feats">
                  {plan.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <a
                  className="vd-vip-card-cta"
                  href={`${VIP_APP_URL}/pricing?plan=${plan.key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid={`vip-cta-${plan.key}`}
                >
                  {plan.cta} →
                </a>
              </div>
            ))}
          </div>

          <div className="vd-vip-foot">
            <a
              className="vd-vip-card-cta"
              href={`${VIP_APP_URL}/demo`}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="vip-cta-demo"
            >
              Ver demo en vivo →
            </a>
            <a
              className="vd-vip-card-cta outline"
              href={`${VIP_APP_URL}/demo`}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="vip-cta-demo"
            >
              Probar simulador
            </a>
          </div>
        </section>

        {/* SERVICES */}
        <section className="vd-section" id="vd-services">
          <div className="vd-section-label">Servicios</div>
          <h2 className="vd-section-title">¿Qué necesita tu negocio?</h2>
          <p className="vd-section-sub">
            Selecciona uno o más servicios para armar tu cotización personalizada.
          </p>

          <div className="vd-grid">
            {SERVICES.map((svc) => (
              <div
                key={svc.key}
                className={`vd-card${selected.includes(svc.key) ? " selected" : ""}`}
                onClick={() => toggleService(svc.key)}
              >
                {selected.includes(svc.key) && <div className="vd-check">✓</div>}
                <div className="vd-card-top">
                  <div className="vd-card-icon">{svc.icon}</div>
                  <div className="vd-card-price">{svc.priceLabel}</div>
                </div>
                <h3>{svc.name}</h3>
                <p>{svc.desc}</p>
                <div className="vd-features">
                  {svc.features.map((f) => (
                    <span key={f} className="vd-feature-tag">{f}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {selected.length > 0 && (
            <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
              <button className="vd-btn-primary" onClick={scrollToForm}>
                Cotizar {selected.length} servicio{selected.length > 1 ? "s" : ""} seleccionado{selected.length > 1 ? "s" : ""} →
              </button>
            </div>
          )}
        </section>

        {/* CONTACT FORM */}
        <section className="vd-section" id="vd-contact">
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <div className="vd-section-label">Contacto</div>
            <h2 className="vd-section-title">Hablemos de tu proyecto</h2>
          </div>

          <div className="vd-form-wrap">
            <div className="vd-form-title">Solicitar cotización</div>
            <div className="vd-form-sub">Te respondemos en menos de 24 horas.</div>

            {selected.length > 0 && (
              <div className="vd-selected-services">
                {selected.map((key) => {
                  const svc = SERVICES.find((s) => s.key === key);
                  return (
                    <div key={key} className="vd-selected-tag">
                      {svc?.icon} {svc?.name}
                      <button onClick={() => toggleService(key)}>×</button>
                    </div>
                  );
                })}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="vd-form-row">
                <div className="vd-field">
                  <label>Nombre *</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Tu nombre"
                    required
                  />
                </div>
                <div className="vd-field">
                  <label>Correo *</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="tu@correo.com"
                    required
                  />
                </div>
              </div>

              <div className="vd-form-row">
                <div className="vd-field">
                  <label>Teléfono / WhatsApp</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+506 8888-8888"
                  />
                </div>
                <div className="vd-field">
                  <label>Servicio de interés</label>
                  <select
                    name="budget"
                    value={form.budget}
                    onChange={handleChange}
                  >
                    <option value="">Seleccionar...</option>
                    {SERVICES.map((s) => (
                      <option key={s.key} value={s.key}>{s.icon} {s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="vd-field" style={{ marginBottom: "0.5rem" }}>
                <label>Cuéntanos sobre tu proyecto</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="¿Qué quieres lograr? ¿Tienes alguna fecha límite?"
                />
              </div>

              <button type="submit" className="vd-submit" disabled={loading}>
                {loading ? "Enviando..." : "Enviar solicitud →"}
              </button>
            </form>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="vd-footer">
          <p>
            <strong>Vertice Digital</strong> · Guanacaste, Costa Rica · {new Date().getFullYear()}
          </p>
          <p style={{ marginTop: "0.4rem" }}>Diseño · Desarrollo · Automatización con IA</p>
        </footer>

      </div>
    </>
  );
};

export default LandingPage;
