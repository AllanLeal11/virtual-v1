import React, { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SERVICES = [
  { key: "Sitios Web", icon: "🌐", name: "Sitios Web", desc: "Diseño y desarrollo de páginas web profesionales, responsivas y optimizadas para SEO.", priceLabel: "₡150,000 – ₡600,000", min: 150000, max: 600000, features: ["Diseño personalizado", "Responsive", "SEO optimizado", "Panel admin"] },
  { key: "Guanacaste Concierge", icon: "🏨", name: "Concierge AI", desc: "Asistente inteligente para hoteles que gestiona reservas y dudas de huéspedes 24/7.", priceLabel: "Suscripción", min: 0, max: null, quote: true, features: ["FastAPI + OpenAI", "Integración Web", "Multilingüe", "Panel de control"] },
  { key: "WhatsApp Bot", icon: "💬", name: "WhatsApp Bot", desc: "Automatiza tu atención al cliente con bots inteligentes para WhatsApp Business.", priceLabel: "₡200,000", min: 200000, max: null, features: ["Respuestas automáticas", "Catálogo de productos", "Atención 24/7", "Integración WhatsApp Business"] },
  { key: "Firma Fácil", icon: "✍️", name: "Firma Digital", desc: "Herramienta para simplificar el flujo de firma digital en portales del BCCR.", priceLabel: "Gratis", min: 0, max: null, features: ["Paso directo Gaudi", "Sin tarjeta física", "Flujo optimizado"] },
  { key: "Facturación Electrónica", icon: "🧾", name: "Facturación Electrónica", desc: "Sistema completo de facturación electrónica integrado con Hacienda Costa Rica.", priceLabel: "₡150,000", min: 150000, max: null, features: ["Integración Hacienda", "Facturas y notas", "Reportes", "Multi-usuario"] },
  { key: "Sistema POS", icon: "🛒", name: "Sistema POS", desc: "Punto de venta moderno para gestionar tu negocio de forma eficiente.", priceLabel: "₡400,000", min: 400000, max: null, features: ["Inventario", "Ventas", "Reportes", "Multi-sucursal"] },
  { key: "Automatizaciones", icon: "⚡", name: "Automatizaciones", desc: "Optimiza tus procesos con flujos automatizados y conexiones entre sistemas.", priceLabel: "Cotización", min: 0, max: null, quote: true, features: ["n8n workflows", "Integraciones API", "Notificaciones", "Reportes auto"] },
];

const STYLES = `
  :root {
    --bg: #0d1117;
    --surface: #161d2b;
    --surface2: #1c2538;
    --gold: #f5a623;
    --gold-dim: #c47f0f;
    --text: #e8edf5;
    --muted: #8899b0;
    --border: rgba(245,166,35,0.15);
  }

  .vd-root * { margin: 0; padding: 0; box-sizing: border-box; }
  .vd-root { scroll-behavior: smooth; }

  .vd-root {
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    font-size: 16px;
    line-height: 1.6;
    overflow-x: hidden;
    min-height: 100vh;
  }

  /* NAV */
  .vd-root nav {
    position: fixed; top: 0; left: 0; right: 0;
    z-index: 100;
    background: rgba(13,17,23,0.92);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 5%;
    height: 64px;
  }

  .vd-root .nav-brand {
    display: flex; align-items: center; gap: 12px;
    text-decoration: none;
  }

  .vd-root .nav-logo {
    width: 38px; height: 38px;
    background: var(--gold);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif;
    font-weight: 800; font-size: 18px;
    color: #0d1117;
    flex-shrink: 0;
  }

  .vd-root .nav-name {
    font-family: 'Syne', sans-serif;
    font-weight: 700; font-size: 1.1rem;
    color: var(--text);
  }

  .vd-root .nav-links {
    display: flex; gap: 32px; list-style: none;
  }

  .vd-root .nav-links a {
    color: var(--muted);
    text-decoration: none;
    font-size: 0.9rem;
    transition: color .2s;
  }

  .vd-root .nav-links a:hover { color: var(--gold); }

  .vd-root .nav-cta {
    background: var(--gold);
    color: #0d1117 !important;
    padding: 8px 20px;
    border-radius: 8px;
    font-weight: 600 !important;
    font-size: 0.85rem !important;
  }

  .vd-root .hamburger {
    display: none;
    flex-direction: column; gap: 5px;
    background: none; border: none;
    cursor: pointer; padding: 4px;
  }

  .vd-root .hamburger span {
    width: 24px; height: 2px;
    background: var(--text);
    border-radius: 2px;
    transition: .3s;
  }

  /* HERO */
  .vd-root .hero {
    min-height: 100vh;
    display: flex; align-items: center;
    padding: 100px 5% 60px;
    position: relative;
    overflow: hidden;
  }

  .vd-root .hero::before {
    content: '';
    position: absolute;
    top: -200px; right: -200px;
    width: 600px; height: 600px;
    background: radial-gradient(circle, rgba(245,166,35,0.08) 0%, transparent 70%);
    pointer-events: none;
  }

  .vd-root .hero::after {
    content: '';
    position: absolute;
    bottom: -100px; left: -100px;
    width: 400px; height: 400px;
    background: radial-gradient(circle, rgba(245,166,35,0.05) 0%, transparent 70%);
    pointer-events: none;
  }

  .vd-root .hero-inner {
    max-width: 1100px; margin: 0 auto; width: 100%;
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 60px; align-items: center;
  }

  .vd-root .hero-tag {
    display: inline-block;
    background: rgba(245,166,35,0.12);
    border: 1px solid rgba(245,166,35,0.3);
    color: var(--gold);
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: .12em;
    text-transform: uppercase;
    padding: 6px 14px;
    border-radius: 100px;
    margin-bottom: 24px;
  }

  .vd-root .hero h1 {
    font-family: 'Syne', sans-serif;
    font-size: clamp(2.2rem, 5vw, 3.6rem);
    font-weight: 800;
    line-height: 1.1;
    margin-bottom: 20px;
  }

  .vd-root .hero h1 span { color: var(--gold); }

  .vd-root .hero p {
    color: var(--muted);
    font-size: 1.05rem;
    margin-bottom: 36px;
    max-width: 420px;
  }

  .vd-root .hero-btns {
    display: flex; gap: 14px; flex-wrap: wrap;
  }

  .vd-root .btn-primary {
    background: var(--gold);
    color: #0d1117;
    padding: 13px 28px;
    border-radius: 10px;
    font-weight: 600;
    font-size: 0.95rem;
    text-decoration: none;
    transition: transform .2s, box-shadow .2s;
    display: inline-block;
    border: none;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
  }

  .vd-root .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(245,166,35,0.3);
  }

  .vd-root .btn-outline {
    border: 1px solid var(--border);
    color: var(--text);
    padding: 13px 28px;
    border-radius: 10px;
    font-weight: 500;
    font-size: 0.95rem;
    text-decoration: none;
    transition: border-color .2s, color .2s;
    display: inline-block;
  }

  .vd-root .btn-outline:hover { border-color: var(--gold); color: var(--gold); }

  .vd-root .hero-visual {
    display: flex; justify-content: center; align-items: center;
    position: relative;
  }

  .vd-root .hero-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 28px;
    width: 280px;
    animation: vdFloat 4s ease-in-out infinite;
  }

  @keyframes vdFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  .vd-root .hero-card-label {
    font-size: 0.75rem;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: .1em;
    margin-bottom: 12px;
  }

  .vd-root .hero-card-num {
    font-family: 'Syne', sans-serif;
    font-size: 2rem;
    font-weight: 800;
    color: var(--gold);
    margin-bottom: 4px;
  }

  .vd-root .hero-card-sub {
    font-size: 0.82rem;
    color: var(--muted);
    margin-bottom: 20px;
  }

  .vd-root .hero-tags {
    display: flex; flex-wrap: wrap; gap: 8px;
  }

  .vd-root .hero-tag-pill {
    background: rgba(245,166,35,0.1);
    border: 1px solid rgba(245,166,35,0.2);
    color: var(--gold);
    font-size: 0.72rem;
    padding: 4px 10px;
    border-radius: 100px;
  }

  /* SECTIONS */
  .vd-root .section { padding: 90px 5%; }
  .vd-root .section-inner { max-width: 1100px; margin: 0 auto; }

  .vd-root .section-tag {
    display: inline-block;
    color: var(--gold);
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: .15em;
    text-transform: uppercase;
    margin-bottom: 12px;
  }

  .vd-root .section-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(1.8rem, 3.5vw, 2.6rem);
    font-weight: 800;
    margin-bottom: 12px;
  }

  .vd-root .section-sub {
    color: var(--muted);
    font-size: 1rem;
    margin-bottom: 52px;
    max-width: 520px;
  }

  /* SERVICES */
  .vd-root .services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }

  .vd-root .service-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 28px;
    transition: border-color .25s, transform .25s;
  }

  .vd-root .service-card:hover {
    border-color: rgba(245,166,35,0.5);
    transform: translateY(-4px);
  }

  .vd-root .service-icon {
    width: 52px; height: 52px;
    background: rgba(245,166,35,0.12);
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px;
    margin-bottom: 18px;
  }

  .vd-root .service-name {
    font-family: 'Syne', sans-serif;
    font-weight: 700; font-size: 1.2rem;
    margin-bottom: 10px;
  }

  .vd-root .service-desc {
    color: var(--muted);
    font-size: 0.9rem;
    margin-bottom: 18px;
    line-height: 1.55;
  }

  .vd-root .service-price {
    color: var(--gold);
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 1.05rem;
    margin-bottom: 18px;
  }

  .vd-root .service-features {
    list-style: none;
    display: flex; flex-direction: column; gap: 8px;
  }

  .vd-root .service-features li {
    display: flex; align-items: center; gap: 10px;
    font-size: 0.88rem;
    color: var(--muted);
  }

  .vd-root .service-features li::before {
    content: '✓';
    color: var(--gold);
    font-weight: 700;
    flex-shrink: 0;
  }

  /* FIRMA TOOL */
  .vd-root .firma-tool {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 32px;
    max-width: 600px;
    margin: 40px auto;
    text-align: center;
  }
  .vd-root .firma-input {
    width: 100%;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text);
    padding: 12px 15px;
    margin-bottom: 16px;
    outline: none;
    font-family: 'DM Sans', sans-serif;
  }
  .vd-root .firma-input:focus { border-color: var(--gold); }
  .vd-root .firma-result {
    background: rgba(245,166,35,0.05);
    border: 1px dashed var(--gold);
    padding: 16px;
    border-radius: 8px;
    margin-top: 20px;
    word-break: break-all;
  }

  /* COTIZADOR */
  .vd-root #cotizador {
    background: var(--surface);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }

  .vd-root .cotizador-grid {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 40px;
    align-items: start;
  }

  .vd-root .cotizador-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(1.8rem, 3vw, 2.4rem);
    font-weight: 800;
    margin-bottom: 8px;
  }

  .vd-root .cotizador-sub {
    color: var(--muted);
    font-size: 0.95rem;
    margin-bottom: 32px;
  }

  .vd-root .service-check {
    display: flex; align-items: center; justify-content: space-between;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 18px 20px;
    margin-bottom: 12px;
    cursor: pointer;
    transition: border-color .2s;
    user-select: none;
  }

  .vd-root .service-check:hover { border-color: rgba(245,166,35,0.4); }
  .vd-root .service-check.active { border-color: var(--gold); background: rgba(245,166,35,0.06); }

  .vd-root .sc-left {
    display: flex; align-items: center; gap: 14px;
  }

  .vd-root .sc-checkbox {
    width: 20px; height: 20px;
    border: 2px solid var(--muted);
    border-radius: 5px;
    display: flex; align-items: center; justify-content: center;
    transition: .2s;
    flex-shrink: 0;
  }

  .vd-root .service-check.active .sc-checkbox {
    background: var(--gold);
    border-color: var(--gold);
    color: #0d1117;
    font-weight: 700;
    font-size: 12px;
  }

  .vd-root .sc-icon { font-size: 18px; }

  .vd-root .sc-name {
    font-weight: 600;
    font-size: 0.95rem;
  }

  .vd-root .sc-price {
    color: var(--muted);
    font-size: 0.88rem;
    text-align: right;
  }

  .vd-root .sc-price.gold { color: var(--gold); font-weight: 600; }

  /* RESUMEN */
  .vd-root .resumen {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 28px;
    position: sticky;
    top: 84px;
  }

  .vd-root .resumen-title {
    font-family: 'Syne', sans-serif;
    font-weight: 700; font-size: 1rem;
    margin-bottom: 20px;
    padding-bottom: 14px;
    border-bottom: 1px solid var(--border);
  }

  .vd-root .resumen-items { margin-bottom: 20px; min-height: 60px; }

  .vd-root .resumen-item {
    display: flex; justify-content: space-between;
    font-size: 0.88rem;
    color: var(--muted);
    margin-bottom: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
  }

  .vd-root .resumen-empty {
    color: var(--muted);
    font-size: 0.85rem;
    text-align: center;
    padding: 16px 0;
  }

  .vd-root .resumen-total {
    display: flex; justify-content: space-between;
    padding-top: 16px;
    border-top: 1px solid var(--border);
    font-weight: 700;
  }

  .vd-root .resumen-total .amount {
    color: var(--gold);
    font-family: 'Syne', sans-serif;
    font-size: 1.1rem;
  }

  .vd-root .resumen-note {
    font-size: 0.75rem;
    color: var(--muted);
    margin-top: 8px;
    text-align: center;
  }

  .vd-root .resumen-btn {
    display: block;
    width: 100%;
    background: var(--gold);
    color: #0d1117;
    border: none;
    border-radius: 10px;
    padding: 13px;
    font-weight: 700;
    font-size: 0.95rem;
    cursor: pointer;
    margin-top: 20px;
    font-family: 'DM Sans', sans-serif;
    transition: transform .2s, box-shadow .2s;
    text-align: center;
    text-decoration: none;
  }

  .vd-root .resumen-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(245,166,35,0.35);
  }

  /* CONTACTO */
  .vd-root #contacto { padding: 90px 5%; }

  .vd-root .contact-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: start;
  }

  .vd-root .contact-info p {
    color: var(--muted);
    font-size: 0.95rem;
    margin-bottom: 32px;
  }

  .vd-root .contact-item {
    display: flex; gap: 14px; align-items: flex-start;
    margin-bottom: 20px;
  }

  .vd-root .contact-icon {
    width: 42px; height: 42px;
    background: rgba(245,166,35,0.1);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
  }

  .vd-root .contact-label {
    font-size: 0.78rem;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: .08em;
    margin-bottom: 3px;
  }

  .vd-root .contact-value {
    font-size: 0.95rem;
    font-weight: 500;
  }

  .vd-root .contact-form {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 32px;
  }

  .vd-root .form-group {
    margin-bottom: 18px;
  }

  .vd-root .form-group label {
    display: block;
    font-size: 0.82rem;
    color: var(--muted);
    margin-bottom: 7px;
    font-weight: 500;
  }

  .vd-root .form-group input,
  .vd-root .form-group textarea,
  .vd-root .form-group select {
    width: 100%;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.92rem;
    padding: 11px 14px;
    outline: none;
    transition: border-color .2s;
  }

  .vd-root .form-group input:focus,
  .vd-root .form-group textarea:focus,
  .vd-root .form-group select:focus {
    border-color: var(--gold);
  }

  .vd-root .form-group select option { background: var(--surface2); }
  .vd-root .form-group textarea { resize: vertical; min-height: 100px; }

  .vd-root .form-btn {
    width: 100%;
    background: var(--gold);
    color: #0d1117;
    border: none;
    border-radius: 10px;
    padding: 13px;
    font-weight: 700;
    font-size: 0.95rem;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: transform .2s, box-shadow .2s;
  }

  .vd-root .form-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(245,166,35,.35);
  }

  .vd-root .form-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  /* FOOTER */
  .vd-root footer {
    border-top: 1px solid var(--border);
    padding: 40px 5%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 20px;
  }

  .vd-root .footer-brand {
    display: flex; align-items: center; gap: 10px;
    text-decoration: none;
  }

  .vd-root .footer-brand .nav-logo { width: 32px; height: 32px; font-size: 15px; }
  .vd-root .footer-brand span { font-family: 'Syne', sans-serif; font-weight: 700; color: var(--text); }

  .vd-root .footer-copy {
    color: var(--muted);
    font-size: 0.82rem;
  }

  /* WHATSAPP FLOAT */
  .vd-root .wa-float {
    position: fixed;
    bottom: 28px; right: 28px;
    z-index: 99;
    width: 56px; height: 56px;
    background: #25D366;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    text-decoration: none;
    box-shadow: 0 4px 20px rgba(37,211,102,0.4);
    transition: transform .2s, box-shadow .2s;
  }

  .vd-root .wa-float:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 28px rgba(37,211,102,0.55);
  }

  .vd-root .wa-float svg { width: 28px; height: 28px; fill: #fff; }

  /* MOBILE MENU */
  .vd-root .mobile-menu {
    display: none;
    position: fixed;
    top: 64px; left: 0; right: 0;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    padding: 20px 5%;
    z-index: 99;
    flex-direction: column;
    gap: 16px;
  }

  .vd-root .mobile-menu.open { display: flex; }

  .vd-root .mobile-menu a {
    color: var(--muted);
    text-decoration: none;
    font-size: 1rem;
    padding: 8px 0;
    border-bottom: 1px solid var(--border);
  }

  .vd-root .mobile-menu a:last-child { border-bottom: none; }

  /* RESPONSIVE */
  @media (max-width: 900px) {
    .vd-root .hero-inner { grid-template-columns: 1fr; }
    .vd-root .hero-visual { display: none; }
    .vd-root .cotizador-grid { grid-template-columns: 1fr; }
    .vd-root .resumen { position: static; }
    .vd-root .contact-grid { grid-template-columns: 1fr; }
    .vd-root .nav-links { display: none; }
    .vd-root .hamburger { display: flex; }
  }

  @media (max-width: 600px) {
    .vd-root .services-grid { grid-template-columns: 1fr; }
    .vd-root .hero { padding-top: 90px; }
    .vd-root footer { flex-direction: column; align-items: flex-start; }
  }
`;

function formatNum(n) {
  return "₡" + n.toLocaleString("es-CR");
}

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selected, setSelected] = useState({}); // { [key]: {min, max, quote} }
  const [form, setForm] = useState({ name: "", email: "", phone: "", service: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  // Admin Access
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [passAttempt, setPassAttempt] = useState("");

  // Firma Digital States
  const [firmaStep, setFirmaStep] = useState(1);
  const [gaudiLink, setGaudiLink] = useState("");
  const [cedula, setCedula] = useState("");
  const [nextLink, setNextLink] = useState("");

  const handleAdminAuth = () => {
    if (passAttempt === "admin123") {
      setIsAuthorized(true);
      toast.success("Acceso concedido");
    } else {
      toast.error("Contraseña incorrecta");
    }
  };

  const handleFirmaProcess = () => {
    if (firmaStep === 1) {
      if (!gaudiLink.toLowerCase().includes("bccr.fi.cr") && !gaudiLink.toLowerCase().includes("gaudi")) {
        toast.error("Por favor ingresa un link de Gaudi o BCCR válido.");
        return;
      }
      setFirmaStep(2);
    } else if (firmaStep === 2) {
      if (!cedula) {
        toast.error("Por favor ingresa tu cédula.");
        return;
      }
      setNextLink("https://oauth2.bccr.fi.cr/personafisica/Account/Login?ReturnUrl=" + btoa(gaudiLink));
      setFirmaStep(3);
      toast.success("¡Link generado con éxito!");
    }
  };

  const toggleService = (svc) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[svc.key]) {
        delete next[svc.key];
      } else {
        next[svc.key] = { min: svc.min, max: svc.max, quote: !!svc.quote };
      }
      return next;
    });
  };

  const keys = Object.keys(selected);
  let minTotal = 0;
  let hasRange = false;
  let hasCotizacion = false;

  keys.forEach((k) => {
    const s = selected[k];
    if (s.quote || s.min === 0) {
      hasCotizacion = true;
    } else if (s.max) {
      minTotal += s.min;
      hasRange = true;
    } else {
      minTotal += s.min;
    }
  });

  const totalLabel =
    keys.length === 0
      ? "₡0"
      : minTotal > 0
      ? hasRange
        ? "Desde " + formatNum(minTotal)
        : formatNum(minTotal)
      : "A cotizar";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const buildWhatsAppUrl = (data, extraContext = "") => {
    const lines = [
      `Hola, soy *${data.name}*.`,
      ``,
      `📧 Correo: ${data.email}`,
      `📱 Teléfono: ${data.phone}`,
      `🛠️ Servicio de interés: ${data.service}`,
      ``,
      `💬 Mensaje:`,
      data.message,
    ];
    if (extraContext) {
      lines.push("", extraContext);
    }
    const text = encodeURIComponent(lines.join("\n"));
    return `https://wa.me/50687518055?text=${text}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.service || !form.message) {
      toast.error("Por favor completa todos los campos.");
      return;
    }
    setSubmitting(true);

    let extraContext = "";
    const selectedKeys = Object.keys(selected);
    if (selectedKeys.length > 0) {
      extraContext = "🧾 Servicios seleccionados en el cotizador:\n" +
        selectedKeys.map((k) => `• ${k}`).join("\n") +
        (totalLabel && totalLabel !== "₡0" ? `\nTotal estimado: ${totalLabel}` : "");
    }

    try {
      await axios.post(`${API}/contact`, form);
      toast.success("¡Mensaje recibido! Abriendo WhatsApp...");
      const waUrl = buildWhatsAppUrl(form, extraContext);
      window.open(waUrl, "_blank", "noopener,noreferrer");
      setForm({ name: "", email: "", phone: "", service: "", message: "" });
    } catch (err) {
      toast.error("Guardado falló, pero te redirigimos a WhatsApp.");
      const waUrl = buildWhatsAppUrl(form, extraContext);
      window.open(waUrl, "_blank", "noopener,noreferrer");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="vd-root">
      <style>{STYLES}</style>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap"
        rel="stylesheet"
      />

      {/* NAV */}
      <nav>
        <a href="#" className="nav-brand">
          <div className="nav-logo">V</div>
          <span className="nav-name">Vértice Digital</span>
        </a>
        <ul className="nav-links">
          <li><a href="#servicios">Servicios</a></li>
          <li><a href="#firma">Admin Tools</a></li>
          <li><a href="#cotizador">Cotizador</a></li>
          <li><a href="#contacto">Contacto</a></li>
          <li><a href="#contacto" className="nav-cta">Hablemos</a></li>
        </ul>
        <button className="hamburger" onClick={() => setMobileOpen((v) => !v)} aria-label="Menú">
          <span></span><span></span><span></span>
        </button>
      </nav>

      {/* MOBILE MENU */}
      <div className={`mobile-menu ${mobileOpen ? "open" : ""}`}>
        <a href="#servicios" onClick={() => setMobileOpen(false)}>Servicios</a>
        <a href="#firma" onClick={() => setMobileOpen(false)}>Admin Tools</a>
        <a href="#cotizador" onClick={() => setMobileOpen(false)}>Cotizador</a>
        <a href="#contacto" onClick={() => setMobileOpen(false)}>Contacto</a>
        <a href="#contacto" onClick={() => setMobileOpen(false)} style={{ color: "var(--gold)", fontWeight: 600 }}>Hablemos →</a>
      </div>

      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-content">
            <div className="hero-tag">Liberia, Guanacaste · Costa Rica</div>
            <h1>Tecnología digital para <span>negocios de Guanacaste</span></h1>
            <p>Soluciones web, automatizaciones y sistemas a medida para impulsar tu negocio en la región.</p>
            <div className="hero-btns">
              <a href="#cotizador" className="btn-primary">Arma tu paquete</a>
              <a href="#servicios" className="btn-outline">Ver servicios</a>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card">
              <div className="hero-card-label">Nuestros servicios</div>
              <div className="hero-card-num">7</div>
              <div className="hero-card-sub">Soluciones disponibles</div>
              <div className="hero-tags">
                <span className="hero-tag-pill">Sitios Web</span>
                <span className="hero-tag-pill">Concierge AI</span>
                <span className="hero-tag-pill">WhatsApp Bot</span>
                <span className="hero-tag-pill">Firma Digital</span>
                <span className="hero-tag-pill">Facturación</span>
                <span className="hero-tag-pill">Sistema POS</span>
                <span className="hero-tag-pill">Automatizaciones</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section className="section" id="servicios">
        <div className="section-inner">
          <span className="section-tag">Lo que hacemos</span>
          <h2 className="section-title">Servicios</h2>
          <p className="section-sub">Soluciones digitales para negocios de la región.</p>

          <div className="services-grid">
            {SERVICES.map((svc) => (
              <div className="service-card" key={svc.key}>
                <div className="service-icon">{svc.icon}</div>
                <div className="service-name">{svc.name}</div>
                <div className="service-desc">{svc.desc}</div>
                <div className="service-price">{svc.priceLabel}</div>
                <ul className="service-features">
                  {svc.features.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FIRMA DIGITAL TOOL (ADMIN PROTECTED) */}
      <section className="section" id="firma" style={{ background: "var(--surface)" }}>
        <div className="section-inner">
          <span className="section-tag">Acceso Administrativo</span>
          <h2 className="section-title">Firma Fácil CR</h2>
          <p className="section-sub">Esta herramienta está protegida. Ingresa la contraseña de administrador para continuar.</p>

          <div className="firma-tool">
            {!isAuthorized ? (
              <>
                <h3 style={{ marginBottom: "16px", fontFamily: "'Syne'" }}>Control de Acceso</h3>
                <input
                  type="password"
                  className="firma-input"
                  placeholder="Contraseña de admin..."
                  value={passAttempt}
                  onChange={(e) => setPassAttempt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdminAuth()}
                />
                <button className="btn-primary" onClick={handleAdminAuth}>Ingresar</button>
              </>
            ) : (
              <>
                {firmaStep === 1 && (
                  <>
                    <h3 style={{ marginBottom: "16px", fontFamily: "'Syne'" }}>Paso 1: Link de Gaudi</h3>
                    <input
                      type="text"
                      className="firma-input"
                      placeholder="Pega el link de Gaudi o BCCR aquí..."
                      value={gaudiLink}
                      onChange={(e) => setGaudiLink(e.target.value)}
                    />
                    <button className="btn-primary" onClick={handleFirmaProcess}>Siguiente</button>
                  </>
                )}

                {firmaStep === 2 && (
                  <>
                    <h3 style={{ marginBottom: "16px", fontFamily: "'Syne'" }}>Paso 2: Datos Adicionales</h3>
                    <input
                      type="text"
                      className="firma-input"
                      placeholder="Número de cédula..."
                      value={cedula}
                      onChange={(e) => setCedula(e.target.value)}
                    />
                    <button className="btn-primary" onClick={handleFirmaProcess}>Generar Link</button>
                    <button
                      style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", marginTop: "10px", display: "block", width: "100%" }}
                      onClick={() => setFirmaStep(1)}
                    >← Volver</button>
                  </>
                )}

                {firmaStep === 3 && (
                  <>
                    <h3 style={{ marginBottom: "16px", fontFamily: "'Syne'" }}>¡Listo!</h3>
                    <p style={{ fontSize: "0.9rem", color: "var(--muted)" }}>Link generado exitosamente:</p>
                    <div className="firma-result">
                      {nextLink}
                    </div>
                    <button
                      className="btn-primary"
                      style={{ marginTop: "20px" }}
                      onClick={() => window.open(nextLink, "_blank")}
                    >Ir al sitio del BCCR</button>
                    <button
                      style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", marginTop: "10px", display: "block", width: "100%" }}
                      onClick={() => { setFirmaStep(1); setGaudiLink(""); setCedula(""); }}
                    >Nueva consulta</button>
                  </>
                )}
                <button
                  style={{ marginTop: "40px", background: "none", border: "1px solid var(--border)", color: "var(--muted)", padding: "8px 16px", borderRadius: "8px", cursor: "pointer" }}
                  onClick={() => setIsAuthorized(false)}
                >Cerrar Sesión Admin</button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* COTIZADOR */}
      <section className="section" id="cotizador">
        <div className="section-inner">
          <span className="section-tag">Cotizador Instantáneo</span>
          <div className="cotizador-grid">
            <div>
              <h2 className="cotizador-title">Arma tu Paquete</h2>
              <p className="cotizador-sub">Selecciona los servicios que necesitas y obtén tu precio al instante.</p>

              {SERVICES.map((svc) => {
                const active = !!selected[svc.key];
                return (
                  <div
                    key={svc.key}
                    className={`service-check ${active ? "active" : ""}`}
                    onClick={() => toggleService(svc)}
                  >
                    <div className="sc-left">
                      <div className="sc-checkbox">{active ? "✓" : ""}</div>
                      <span className="sc-icon">{svc.icon}</span>
                      <span className="sc-name">{svc.name}</span>
                    </div>
                    <span className={`sc-price ${svc.quote ? "gold" : ""}`}>{svc.priceLabel}</span>
                  </div>
                );
              })}
            </div>

            {/* RESUMEN */}
            <div className="resumen">
              <div className="resumen-title">Tu resumen</div>
              <div className="resumen-items">
                {keys.length === 0 ? (
                  <div className="resumen-empty">Selecciona servicios para ver tu estimado</div>
                ) : (
                  keys.map((k) => {
                    const s = selected[k];
                    let priceLabel;
                    if (s.quote || s.min === 0) priceLabel = "Cotización";
                    else if (s.max) priceLabel = formatNum(s.min) + " – " + formatNum(s.max);
                    else priceLabel = formatNum(s.min);
                    return (
                      <div className="resumen-item" key={k}>
                        <span>{k}</span>
                        <span>{priceLabel}</span>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="resumen-total">
                <span>Total estimado</span>
                <span className="amount">{totalLabel}</span>
              </div>
              <div className="resumen-note">
                {hasCotizacion ? "* Automatizaciones se cotiza según proyecto." : ""}
              </div>
              <a
                href="#contacto"
                className="resumen-btn"
                onClick={() => {
                  if (keys.length > 0) {
                    const summary = keys.join(", ");
                    setForm((prev) => ({
                      ...prev,
                      service: keys.length === 1 ? keys[0] : "Otro / varios",
                      message: prev.message
                        ? prev.message
                        : `Me interesa cotizar: ${summary}. ${hasRange ? "(" + totalLabel + ")" : ""}`.trim(),
                    }));
                  }
                }}
              >Solicitar cotización →</a>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACTO */}
      <section className="section" id="contacto">
        <div className="section-inner">
          <span className="section-tag">Contacto</span>
          <div className="contact-grid">
            <div className="contact-info">
              <h2 className="section-title">Hablemos</h2>
              <p>¿Listo para digitalizar tu negocio? Escríbenos y te respondemos rápido.</p>

              <div className="contact-item">
                <div className="contact-icon">📍</div>
                <div>
                  <div className="contact-label">Ubicación</div>
                  <div className="contact-value">Liberia, Guanacaste, Costa Rica</div>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">💬</div>
                <div>
                  <div className="contact-label">WhatsApp</div>
                  <a href="https://wa.me/50687518055" className="contact-value" style={{ color: "var(--text)", textDecoration: "none" }}>
                    Escríbenos por WhatsApp
                  </a>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">✉️</div>
                <div>
                  <div className="contact-label">Correo</div>
                  <a href="mailto:verticedigital11@gmail.com" className="contact-value" style={{ color: "var(--text)", textDecoration: "none" }}>
                    verticedigital11@gmail.com
                  </a>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">🕐</div>
                <div>
                  <div className="contact-label">Horario</div>
                  <div className="contact-value">Lunes – Viernes, 8 am – 6 pm</div>
                </div>
              </div>
            </div>

            <form className="contact-form" onSubmit={handleSubmit}>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1.15rem", marginBottom: "22px" }}>
                Envíanos un mensaje
              </h3>

              <div className="form-group">
                <label>Nombre</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Tu nombre" />
              </div>

              <div className="form-group">
                <label>Correo electrónico</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="tucorreo@ejemplo.com" />
              </div>

              <div className="form-group">
                <label>Teléfono / WhatsApp</label>
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+506 ···· ····" />
              </div>

              <div className="form-group">
                <label>Servicio de interés</label>
                <select name="service" value={form.service} onChange={handleChange}>
                  <option value="">Seleccionar…</option>
                  <option>Sitio Web</option>
                  <option>WhatsApp Bot</option>
                  <option>Firma Digital</option>
                  <option>Facturación Electrónica</option>
                  <option>Sistema POS</option>
                  <option>Automatizaciones</option>
                  <option>Otro / varios</option>
                </select>
              </div>

              <div className="form-group">
                <label>Mensaje</label>
                <textarea name="message" value={form.message} onChange={handleChange} placeholder="Cuéntanos sobre tu negocio…" />
              </div>

              <button type="submit" className="form-btn" disabled={submitting}>
                {submitting ? "Enviando..." : "Enviar mensaje"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <a href="#" className="footer-brand">
          <div className="nav-logo">V</div>
          <span>Vértice Digital</span>
        </a>
        <span className="footer-copy">© 2025 Vértice Digital </span>
      </footer>

      {/* WHATSAPP FLOAT */}
      <a href="https://wa.me/50687518055" className="wa-float" target="_blank" rel="noreferrer" aria-label="WhatsApp">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </div>
  );
}
