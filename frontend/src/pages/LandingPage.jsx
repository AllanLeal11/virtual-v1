import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SERVICES = [
  { key: "Sitios Web", icon: "🌐", name: "Sitios Web", desc: "Diseño y desarrollo de páginas web profesionales, responsivas y optimizadas para SEO.", priceLabel: "₡150,000 – ₡600,000", features: ["Diseño personalizado", "Responsive", "SEO optimizado", "Panel admin"] },
  { key: "Guanacaste Concierge", icon: "🏨", name: "Concierge AI", desc: "Asistente inteligente para hoteles que gestiona reservas y dudas de huéspedes 24/7.", priceLabel: "Suscripción", features: ["FastAPI + OpenAI", "Integración Web", "Multilingüe", "Panel de control"] },
  { key: "WhatsApp Bot", icon: "💬", name: "WhatsApp Bot", desc: "Automatiza tu atención al cliente con bots inteligentes para WhatsApp Business.", priceLabel: "₡200,000", features: ["Respuestas automáticas", "Catálogo de productos", "Atención 24/7", "Integración WhatsApp Business"] },
  { key: "AirBnB Hub", icon: "🏠", name: "AirBnB Automation", desc: "Automatización total para anfitriones. Check-ins, guías digitales y comunicación automática.", priceLabel: "Consultar", features: ["Check-in digital", "Guías interactivas", "Sync con calendarios", "IA Concierge"] },
  { key: "E-commerce Pro", icon: "🛍️", name: "E-commerce Local", desc: "Lleve sus productos de Guanacaste a todo el mundo. Tiendas online rápidas y seguras.", priceLabel: "Desde ₡250,000", features: ["Pagos con tarjeta/SINPE", "Gestión de inventario", "SEO para productos", "Diseño Premium"] },
  { key: "Sistema POS", icon: "🛒", name: "Sistema POS", desc: "Punto de venta moderno para gestionar tu negocio de forma eficiente.", priceLabel: "₡400,000", features: ["Inventario", "Ventas", "Reportes", "Multi-sucursal"] },
  { key: "Automatizaciones", icon: "⚡", name: "Automatizaciones", desc: "Optimiza tus procesos con flujos automatizados y conexiones entre sistemas.", priceLabel: "Cotización", features: ["n8n workflows", "Integraciones API", "Notificaciones", "Reportes auto"] },
];

const VIP_APP_URL = process.env.REACT_APP_VIP_URL || "https://premium-whats-app--verticedigital1.replit.app";
const ARIA_URL = process.env.REACT_APP_ARIA_URL || "https://aria-asistente-84p7.vercel.app";

const VIP_PLANS = [
  { key: "starter", name: "Básico", price: "$29", period: "/mes", tagline: "Para arrancar y probar el bot oficial.", features: ["1 número WhatsApp Business API", "Hasta 1.000 conversaciones/mes", "Plantillas IA precargadas", "Anti-baneo automático"], cta: "Empezar Básico" },
  { key: "pro", name: "Pro", price: "$59", period: "/mes", tagline: "El más elegido por restaurantes y hoteles.", popular: true, features: ["Todo lo del plan Básico", "Hasta 5.000 conversaciones/mes", "Modo Pánico + alertas en vivo", "Simulador de chat y ROI", "Configuración Cero Estrés"], cta: "Activar Pro" },
  { key: "premium", name: "Premium", price: "$149", period: "/mes", tagline: "Para operaciones serias y multi-sucursal.", features: ["Todo lo del plan Pro", "Conversaciones ilimitadas", "Multi-sucursal / multi-agente", "Integración n8n + CRM", "Soporte prioritario 24/7"], cta: "Activar Premium" },
];

const styles = `
  :root {
    --bg: #050811;
    --bg2: #0a0f1c;
    --surface: rgba(255,255,255,0.03);
    --surface-hover: rgba(255,255,255,0.06);
    --border: rgba(255,255,255,0.08);
    --border-hover: rgba(0,245,212,0.4);
    --text: #ffffff;
    --text-muted: rgba(255,255,255,0.6);
    --text-dim: rgba(255,255,255,0.4);
    --accent: #00f5d4;
    --accent-2: #7c3aed;
    --accent-3: #f72585;
    --gradient-1: linear-gradient(135deg, #00f5d4 0%, #00d4ff 50%, #7c3aed 100%);
    --gradient-2: linear-gradient(135deg, #f72585 0%, #7c3aed 50%, #00f5d4 100%);
    --gradient-3: linear-gradient(135deg, #facc15 0%, #f72585 50%, #7c3aed 100%);
    --shadow-soft: 0 8px 32px rgba(0,0,0,0.4);
    --shadow-glow: 0 0 60px rgba(0,245,212,0.15);
  }

  * { box-sizing: border-box; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
  html { scroll-behavior: smooth; }
  body { margin: 0; background: var(--bg); color: var(--text); font-family: 'Inter', system-ui, -apple-system, sans-serif; font-weight: 400; overflow-x: hidden; }

  /* Mesh gradient background base */
  .vd-mesh-bg {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background:
      radial-gradient(ellipse 80% 60% at 15% 10%, rgba(0,245,212,0.18) 0%, transparent 50%),
      radial-gradient(ellipse 70% 50% at 85% 30%, rgba(124,58,237,0.22) 0%, transparent 50%),
      radial-gradient(ellipse 90% 60% at 50% 100%, rgba(247,37,133,0.15) 0%, transparent 50%),
      linear-gradient(180deg, #050811 0%, #0a0f1c 100%);
    animation: meshShift 22s ease-in-out infinite;
  }
  @keyframes meshShift {
    0%, 100% { filter: hue-rotate(0deg); }
    50% { filter: hue-rotate(30deg); }
  }
  .vd-mesh-bg::before {
    content: '';
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
    background-size: 80px 80px;
    mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
  }

  /* Typography */
  .vd-h1, .vd-h2, .vd-h3, .vd-h-display { font-family: 'Space Grotesk', sans-serif; font-weight: 700; letter-spacing: -0.02em; line-height: 1.05; }
  .vd-h-display { font-size: clamp(2.8rem, 7vw, 5.5rem); }
  .vd-h1 { font-size: clamp(2.2rem, 5vw, 3.8rem); }
  .vd-h2 { font-size: clamp(1.7rem, 3.5vw, 2.6rem); }
  .vd-h3 { font-size: clamp(1.2rem, 2vw, 1.5rem); }
  .vd-eyebrow { font-family: 'Space Grotesk', sans-serif; font-weight: 500; font-size: 0.75rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--accent); }
  .vd-body { font-family: 'Inter', sans-serif; }
  .vd-mono { font-family: 'Space Grotesk', sans-serif; font-variant-numeric: tabular-nums; }

  /* Gradient text */
  .vd-grad-1 { background: var(--gradient-1); -webkit-background-clip: text; background-clip: text; color: transparent; }
  .vd-grad-2 { background: var(--gradient-2); -webkit-background-clip: text; background-clip: text; color: transparent; }
  .vd-grad-3 { background: var(--gradient-3); -webkit-background-clip: text; background-clip: text; color: transparent; }

  /* Layout */
  .vd-wrap { position: relative; z-index: 1; }
  .vd-container { max-width: 1280px; margin: 0 auto; padding: 0 1.5rem; }

  /* Custom cursor */
  .vd-cursor {
    position: fixed; pointer-events: none; z-index: 9999;
    width: 18px; height: 18px;
    border-radius: 50%;
    background: var(--accent);
    mix-blend-mode: difference;
    transition: transform 0.15s ease, width 0.2s, height 0.2s;
    transform: translate(-50%, -50%);
  }
  .vd-cursor.hovering { width: 48px; height: 48px; background: rgba(0,245,212,0.5); }
  @media (max-width: 768px) { .vd-cursor { display: none; } }

  /* NAV */
  .vd-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    padding: 1rem 1.5rem;
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    background: rgba(5,8,17,0.55);
    border-bottom: 1px solid var(--border);
    display: flex; justify-content: space-between; align-items: center;
  }
  .vd-logo { display: flex; align-items: center; gap: 0.75rem; text-decoration: none; color: var(--text); }
  .vd-logo-mark {
    width: 38px; height: 38px;
    border-radius: 11px;
    background: var(--gradient-1);
    display: grid; place-items: center;
    font-family: 'Space Grotesk', sans-serif; font-weight: 700; color: #050811;
    box-shadow: 0 8px 24px rgba(0,245,212,0.35);
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .vd-logo:hover .vd-logo-mark { transform: rotate(-8deg) scale(1.05); }
  .vd-logo-text { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 1.05rem; letter-spacing: -0.01em; }
  .vd-nav-cta {
    padding: 0.6rem 1.25rem;
    background: var(--gradient-1);
    color: #050811;
    border: none;
    border-radius: 100px;
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 600; font-size: 0.85rem;
    cursor: pointer;
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s;
    box-shadow: 0 8px 24px rgba(0,245,212,0.3);
  }
  .vd-nav-cta:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(0,245,212,0.5); }

  /* HERO */
  .vd-hero {
    position: relative;
    min-height: 100vh;
    padding: 8rem 1.5rem 6rem;
    display: flex; align-items: center; justify-content: center;
    overflow: hidden;
  }
  .vd-hero-orb {
    position: absolute; z-index: 0;
    width: 700px; height: 700px;
    border-radius: 50%;
    background: var(--gradient-1);
    filter: blur(140px); opacity: 0.35;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    animation: orbFloat 10s ease-in-out infinite;
  }
  @keyframes orbFloat {
    0%, 100% { transform: translate(-50%, -50%) scale(1); }
    50% { transform: translate(-50%, -55%) scale(1.08); }
  }
  .vd-hero-inner { position: relative; z-index: 2; max-width: 1100px; text-align: center; }
  .vd-hero-badge {
    display: inline-flex; align-items: center; gap: 0.5rem;
    padding: 0.4rem 1rem;
    border-radius: 100px;
    background: rgba(255,255,255,0.05);
    border: 1px solid var(--border);
    backdrop-filter: blur(10px);
    font-family: 'Space Grotesk', sans-serif; font-size: 0.78rem; font-weight: 500;
    color: var(--text-muted);
    margin-bottom: 2rem;
  }
  .vd-hero-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 12px var(--accent); animation: pulse 2s ease-in-out infinite; }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.3); }
  }
  .vd-hero-sub { font-size: clamp(1rem, 1.5vw, 1.25rem); color: var(--text-muted); max-width: 720px; margin: 1.5rem auto 0; line-height: 1.6; }
  .vd-hero-actions { margin-top: 3rem; display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center; }

  /* Buttons */
  .vd-btn {
    position: relative;
    padding: 1rem 2rem;
    border-radius: 100px;
    border: none;
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 600; font-size: 0.95rem;
    cursor: pointer;
    text-decoration: none;
    display: inline-flex; align-items: center; gap: 0.5rem;
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s;
    overflow: hidden;
  }
  .vd-btn-primary {
    background: var(--gradient-1);
    color: #050811;
    box-shadow: 0 10px 30px rgba(0,245,212,0.35);
  }
  .vd-btn-primary:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 15px 40px rgba(0,245,212,0.55); }
  .vd-btn-ghost {
    background: rgba(255,255,255,0.04);
    color: var(--text);
    border: 1px solid var(--border);
    backdrop-filter: blur(10px);
  }
  .vd-btn-ghost:hover { background: rgba(255,255,255,0.08); border-color: var(--accent); transform: translateY(-3px); }
  .vd-btn-arrow { transition: transform 0.3s; display: inline-block; }
  .vd-btn:hover .vd-btn-arrow { transform: translateX(4px); }

  /* HERO stats */
  .vd-hero-stats {
    margin-top: 5rem;
    display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 2rem;
    max-width: 900px; margin-left: auto; margin-right: auto;
  }
  .vd-stat { text-align: center; }
  .vd-stat-num { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: clamp(2.2rem, 4vw, 3.2rem); letter-spacing: -0.02em; }
  .vd-stat-label { font-size: 0.82rem; color: var(--text-muted); margin-top: 0.5rem; text-transform: uppercase; letter-spacing: 0.1em; font-family: 'Space Grotesk', sans-serif; }

  /* SECTION */
  .vd-section { padding: 7rem 1.5rem; position: relative; }
  .vd-section-head { max-width: 800px; margin: 0 auto 4rem; text-align: center; }
  .vd-section-head .vd-eyebrow { display: inline-block; margin-bottom: 1rem; }
  .vd-section-head .vd-h1 { margin: 0; }
  .vd-section-head p { color: var(--text-muted); font-size: 1.1rem; margin-top: 1rem; line-height: 1.6; }

  /* Cards grid */
  .vd-grid {
    display: grid; gap: 1.5rem;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    max-width: 1280px; margin: 0 auto;
  }
  .vd-card {
    position: relative;
    padding: 2rem;
    border-radius: 24px;
    background: rgba(255,255,255,0.025);
    border: 1px solid var(--border);
    backdrop-filter: blur(20px);
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s, background 0.3s;
    overflow: hidden;
    cursor: pointer;
  }
  .vd-card::before {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(600px circle at var(--mx, 0px) var(--my, 0px), rgba(0,245,212,0.08), transparent 40%);
    opacity: 0; transition: opacity 0.3s;
    pointer-events: none;
  }
  .vd-card:hover { transform: translateY(-6px); border-color: var(--border-hover); background: rgba(255,255,255,0.04); }
  .vd-card:hover::before { opacity: 1; }
  .vd-card.selected { border-color: var(--accent); background: rgba(0,245,212,0.06); }
  .vd-card-icon { font-size: 2.2rem; display: inline-block; margin-bottom: 1rem; }
  .vd-card h3 { margin: 0 0 0.6rem; font-family: 'Space Grotesk', sans-serif; font-size: 1.25rem; font-weight: 600; }
  .vd-card-desc { color: var(--text-muted); font-size: 0.95rem; line-height: 1.55; margin-bottom: 1.2rem; }
  .vd-card-price {
    font-family: 'Space Grotesk', sans-serif; font-weight: 600;
    color: var(--accent); font-size: 0.9rem;
    margin-bottom: 1rem;
  }
  .vd-features { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.4rem; }
  .vd-features li {
    font-size: 0.85rem; color: var(--text-muted);
    display: flex; align-items: center; gap: 0.5rem;
  }
  .vd-features li::before {
    content: ''; width: 5px; height: 5px; border-radius: 50%;
    background: var(--accent); flex-shrink: 0;
  }

  /* ARIA section */
  .vd-aria-section {
    margin: 4rem auto; max-width: 1280px;
    padding: 4rem 2.5rem;
    border-radius: 32px;
    background:
      radial-gradient(ellipse at top right, rgba(124,58,237,0.18), transparent 60%),
      radial-gradient(ellipse at bottom left, rgba(0,245,212,0.15), transparent 60%),
      rgba(255,255,255,0.02);
    border: 1px solid var(--border);
    display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: center;
  }
  .vd-aria-section h2 { margin: 0.5rem 0 1rem; }
  .vd-aria-section p { color: var(--text-muted); font-size: 1.05rem; line-height: 1.6; }
  .vd-aria-frame-wrap {
    position: relative;
    aspect-ratio: 9 / 14;
    border-radius: 24px; overflow: hidden;
    border: 1px solid var(--border);
    box-shadow: var(--shadow-soft), 0 0 80px rgba(0,245,212,0.15);
  }
  .vd-aria-frame-wrap iframe { width: 100%; height: 100%; border: 0; }
  @media (max-width: 900px) {
    .vd-aria-section { grid-template-columns: 1fr; padding: 2.5rem 1.5rem; }
    .vd-aria-frame-wrap { aspect-ratio: 9/12; max-width: 360px; margin: 0 auto; }
  }

  /* VIP plans */
  .vd-vip-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; max-width: 1100px; margin: 0 auto; }
  .vd-vip-card {
    position: relative;
    padding: 2.5rem 2rem;
    border-radius: 28px;
    background: rgba(255,255,255,0.025);
    border: 1px solid var(--border);
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s;
    backdrop-filter: blur(20px);
  }
  .vd-vip-card:hover { transform: translateY(-8px); border-color: var(--border-hover); }
  .vd-vip-card.popular {
    background: linear-gradient(180deg, rgba(0,245,212,0.08), rgba(124,58,237,0.06));
    border-color: var(--accent);
    box-shadow: 0 20px 50px rgba(0,245,212,0.2);
  }
  .vd-vip-badge {
    position: absolute; top: -12px; left: 50%;
    transform: translateX(-50%);
    background: var(--gradient-1);
    color: #050811;
    padding: 0.3rem 1rem;
    border-radius: 100px;
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 600; font-size: 0.72rem;
    letter-spacing: 0.05em; text-transform: uppercase;
  }
  .vd-vip-price { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 2.8rem; letter-spacing: -0.03em; }
  .vd-vip-period { font-size: 1rem; color: var(--text-muted); }
  .vd-vip-tagline { color: var(--text-muted); font-size: 0.9rem; margin-bottom: 2rem; line-height: 1.5; }
  .vd-vip-features { margin: 2rem 0; }

  /* Form */
  .vd-form {
    max-width: 700px; margin: 0 auto;
    padding: 2.5rem;
    border-radius: 28px;
    background: rgba(255,255,255,0.025);
    border: 1px solid var(--border);
    backdrop-filter: blur(20px);
  }
  .vd-form-grid { display: grid; gap: 1rem; }
  .vd-form-row { display: grid; gap: 1rem; grid-template-columns: 1fr 1fr; }
  @media (max-width: 640px) { .vd-form-row { grid-template-columns: 1fr; } }
  .vd-input, .vd-textarea, .vd-select {
    width: 100%;
    padding: 0.95rem 1.1rem;
    background: rgba(255,255,255,0.03);
    border: 1px solid var(--border);
    border-radius: 14px;
    color: var(--text);
    font-family: 'Inter', sans-serif;
    font-size: 0.95rem;
    transition: border-color 0.2s, background 0.2s;
    outline: none;
  }
  .vd-input:focus, .vd-textarea:focus, .vd-select:focus {
    border-color: var(--accent);
    background: rgba(0,245,212,0.04);
  }
  .vd-textarea { min-height: 130px; resize: vertical; font-family: 'Inter', sans-serif; }
  .vd-label { font-family: 'Space Grotesk', sans-serif; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.4rem; display: block; }

  /* Marquee */
  .vd-marquee {
    overflow: hidden; padding: 3rem 0;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    background: rgba(0,0,0,0.2);
    margin: 4rem 0 0;
  }
  .vd-marquee-track {
    display: flex; gap: 4rem; white-space: nowrap;
    animation: marquee 30s linear infinite;
  }
  .vd-marquee-item {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 2rem; font-weight: 700;
    color: var(--text-muted);
    display: flex; align-items: center; gap: 1rem;
  }
  .vd-marquee-item::before { content: '◆'; color: var(--accent); font-size: 0.6em; }
  @keyframes marquee {
    to { transform: translateX(-50%); }
  }

  /* Footer */
  .vd-footer {
    padding: 4rem 1.5rem 3rem;
    border-top: 1px solid var(--border);
    text-align: center;
    color: var(--text-dim); font-size: 0.85rem;
  }
  .vd-footer-links { display: flex; gap: 1.5rem; justify-content: center; flex-wrap: wrap; margin-bottom: 1.5rem; }
  .vd-footer-links a { color: var(--text-muted); text-decoration: none; transition: color 0.2s; }
  .vd-footer-links a:hover { color: var(--accent); }

  /* Aria FAB */
  .vd-aria-fab {
    position: fixed; bottom: 24px; right: 24px;
    width: 64px; height: 64px;
    border-radius: 50%;
    border: 1px solid rgba(0,245,212,0.4);
    background: var(--gradient-1);
    color: #050811; font-size: 26px;
    cursor: pointer;
    box-shadow: 0 10px 40px rgba(0,245,212,0.5);
    z-index: 9999;
    display: flex; align-items: center; justify-content: center;
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .vd-aria-fab:hover { transform: scale(1.1) rotate(-5deg); }
  .vd-aria-frame-popup {
    position: fixed; bottom: 100px; right: 24px;
    width: 380px; height: 580px;
    max-width: calc(100vw - 32px); max-height: calc(100vh - 130px);
    border: 1px solid var(--border); border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 25px 70px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,245,212,0.2);
    z-index: 9998;
    background: #050811;
    animation: ariaSlide 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  @keyframes ariaSlide {
    from { opacity: 0; transform: translateY(20px) scale(0.95); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* Reveal animations */
  .vd-reveal { opacity: 0; transform: translateY(40px); transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
  .vd-reveal.in-view { opacity: 1; transform: translateY(0); }

  /* Selected pill */
  .vd-selected-pills {
    display: flex; gap: 0.5rem; flex-wrap: wrap; margin: 1rem 0;
  }
  .vd-pill {
    padding: 0.4rem 0.9rem;
    border-radius: 100px;
    background: rgba(0,245,212,0.1);
    border: 1px solid rgba(0,245,212,0.3);
    color: var(--accent);
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.78rem;
  }
`;

const LandingPage = () => {
  const [selected, setSelected] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", phone: "", budget: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [ariaOpen, setAriaOpen] = useState(false);
  const cursorRef = useRef(null);

  // Custom cursor
  useEffect(() => {
    const onMove = (e) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = e.clientX + "px";
        cursorRef.current.style.top = e.clientY + "px";
      }
    };
    const onEnter = () => cursorRef.current?.classList.add("hovering");
    const onLeave = () => cursorRef.current?.classList.remove("hovering");
    window.addEventListener("mousemove", onMove);
    document.querySelectorAll("a, button, .vd-card").forEach((el) => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Scroll reveal with IntersectionObserver (GSAP-style without dependency)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("in-view")),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".vd-reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Card mouse tracking for spotlight effect
  useEffect(() => {
    const cards = document.querySelectorAll(".vd-card, .vd-vip-card");
    const onMove = (e) => {
      const r = e.currentTarget.getBoundingClientRect();
      e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
      e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    cards.forEach((c) => c.addEventListener("mousemove", onMove));
    return () => cards.forEach((c) => c.removeEventListener("mousemove", onMove));
  }, []);

  // Vanta.js globe in hero (loaded via CDN scripts in index.html)
  useEffect(() => {
    let effect;
    const interval = setInterval(() => {
      if (window.VANTA && window.VANTA.GLOBE && document.getElementById("vd-vanta-globe")) {
        effect = window.VANTA.GLOBE({
          el: "#vd-vanta-globe",
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          scale: 1.0,
          scaleMobile: 1.0,
          color: 0x00f5d4,
          color2: 0x7c3aed,
          size: 1.0,
          backgroundColor: 0x050811,
        });
        clearInterval(interval);
      }
    }, 200);
    return () => {
      clearInterval(interval);
      if (effect) effect.destroy();
    };
  }, []);

  const toggleService = (key) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const scrollToForm = () => {
    document.getElementById("vd-contact")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast.error("Por favor ingresa tu nombre y correo.");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/contact`, { ...form, services: selected });
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
      <div className="vd-mesh-bg" />
      <div ref={cursorRef} className="vd-cursor" />

      <div className="vd-wrap">
        {/* NAV */}
        <nav className="vd-nav">
          <a href="#top" className="vd-logo">
            <span className="vd-logo-mark">V</span>
            <span className="vd-logo-text">Vértice Digital</span>
          </a>
          <button className="vd-nav-cta" onClick={scrollToForm}>Cotizar →</button>
        </nav>

        {/* HERO */}
        <section className="vd-hero" id="top">
          <div id="vd-vanta-globe" style={{ position: "absolute", inset: 0, zIndex: 1, opacity: 0.45 }} />
          <div className="vd-hero-orb" />
          <div className="vd-hero-inner vd-reveal">
            <div className="vd-hero-badge">
              <span className="vd-hero-badge-dot" />
              Tecnología con IA · Liberia, Guanacaste
            </div>
            <h1 className="vd-h-display">
              Construimos el <span className="vd-grad-1">futuro digital</span> de tu negocio.
            </h1>
            <p className="vd-hero-sub">
              Asistentes virtuales con IA, sitios web premium, bots de WhatsApp y automatizaciones para empresas que quieren dejar atrás el papel y abrazar la inteligencia.
            </p>
            <div className="vd-hero-actions">
              <button className="vd-btn vd-btn-primary" onClick={scrollToForm}>
                Empezar proyecto <span className="vd-btn-arrow">→</span>
              </button>
              <a className="vd-btn vd-btn-ghost" href={ARIA_URL} target="_blank" rel="noopener noreferrer">
                Ver demo Aria
              </a>
            </div>

            <div className="vd-hero-stats">
              <div className="vd-stat">
                <div className="vd-stat-num vd-grad-1">8+</div>
                <div className="vd-stat-label">Google Cloud Certs</div>
              </div>
              <div className="vd-stat">
                <div className="vd-stat-num vd-grad-2">24/7</div>
                <div className="vd-stat-label">Asistencia IA</div>
              </div>
              <div className="vd-stat">
                <div className="vd-stat-num vd-grad-3">100%</div>
                <div className="vd-stat-label">Made in Costa Rica</div>
              </div>
              <div className="vd-stat">
                <div className="vd-stat-num vd-grad-1">∞</div>
                <div className="vd-stat-label">Posibilidades</div>
              </div>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section className="vd-section" id="vd-services">
          <div className="vd-section-head vd-reveal">
            <span className="vd-eyebrow">Servicios</span>
            <h2 className="vd-h1">
              Soluciones <span className="vd-grad-2">a tu medida</span>
            </h2>
            <p>
              Cada negocio es único. Por eso construimos cada solución desde cero, optimizada para tu mercado y tus clientes.
            </p>
          </div>

          <div className="vd-grid vd-reveal">
            {SERVICES.map((s) => (
              <div
                key={s.key}
                className={`vd-card ${selected.includes(s.key) ? "selected" : ""}`}
                onClick={() => toggleService(s.key)}
              >
                <span className="vd-card-icon">{s.icon}</span>
                <h3>{s.name}</h3>
                <div className="vd-card-price">{s.priceLabel}</div>
                <p className="vd-card-desc">{s.desc}</p>
                <ul className="vd-features">
                  {s.features.map((f) => <li key={f}>{f}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ARIA SHOWCASE */}
        <section className="vd-section">
          <div className="vd-aria-section vd-reveal">
            <div>
              <span className="vd-eyebrow">Producto estrella</span>
              <h2 className="vd-h1">
                Conocé a <span className="vd-grad-1">Aria</span>
              </h2>
              <p style={{ marginBottom: "1.5rem" }}>
                Una asistente virtual con voz neural costarricense, capaz de atender huéspedes, capturar reservas y resolver dudas <strong style={{ color: "var(--accent)" }}>24/7 en español e inglés</strong>.
              </p>
              <p style={{ marginBottom: "2rem" }}>
                Probala ahora mismo. Si te gusta, en 48 horas la implementamos en tu negocio personalizada con tu marca.
              </p>
              <a className="vd-btn vd-btn-primary" href={ARIA_URL} target="_blank" rel="noopener noreferrer">
                Probar Aria gratis <span className="vd-btn-arrow">→</span>
              </a>
            </div>
            <div className="vd-aria-frame-wrap">
              <iframe src={ARIA_URL} title="Aria Demo" loading="lazy" />
            </div>
          </div>
        </section>

        {/* VIP PLANS */}
        <section className="vd-section" id="vd-vip">
          <div className="vd-section-head vd-reveal">
            <span className="vd-eyebrow">WhatsApp VIP Business</span>
            <h2 className="vd-h1">
              Planes <span className="vd-grad-3">SaaS</span>
            </h2>
            <p>
              Bots oficiales de WhatsApp con IA. Sin código. Sin baneos. Sin sorpresas.
            </p>
          </div>

          <div className="vd-vip-grid vd-reveal">
            {VIP_PLANS.map((p) => (
              <div key={p.key} className={`vd-vip-card ${p.popular ? "popular" : ""}`}>
                {p.popular && <div className="vd-vip-badge">Más popular</div>}
                <h3 className="vd-h3" style={{ fontFamily: 'Space Grotesk', fontWeight: 600, margin: 0 }}>{p.name}</h3>
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.3rem", margin: "1rem 0 0.5rem" }}>
                  <span className="vd-vip-price">{p.price}</span>
                  <span className="vd-vip-period">{p.period}</span>
                </div>
                <p className="vd-vip-tagline">{p.tagline}</p>
                <ul className="vd-features vd-vip-features">
                  {p.features.map((f) => <li key={f}>{f}</li>)}
                </ul>
                <a className={`vd-btn ${p.popular ? "vd-btn-primary" : "vd-btn-ghost"}`} href={VIP_APP_URL} target="_blank" rel="noopener noreferrer" style={{ width: "100%", justifyContent: "center" }}>
                  {p.cta} <span className="vd-btn-arrow">→</span>
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* MARQUEE */}
        <section className="vd-marquee">
          <div className="vd-marquee-track">
            <div className="vd-marquee-item">Inteligencia Artificial</div>
            <div className="vd-marquee-item">Desarrollo Web</div>
            <div className="vd-marquee-item">WhatsApp Business</div>
            <div className="vd-marquee-item">Automatización</div>
            <div className="vd-marquee-item">Google Cloud</div>
            <div className="vd-marquee-item">SEO</div>
            <div className="vd-marquee-item">Inteligencia Artificial</div>
            <div className="vd-marquee-item">Desarrollo Web</div>
            <div className="vd-marquee-item">WhatsApp Business</div>
            <div className="vd-marquee-item">Automatización</div>
            <div className="vd-marquee-item">Google Cloud</div>
            <div className="vd-marquee-item">SEO</div>
          </div>
        </section>

        {/* CONTACT FORM */}
        <section className="vd-section" id="vd-contact">
          <div className="vd-section-head vd-reveal">
            <span className="vd-eyebrow">Contáctanos</span>
            <h2 className="vd-h1">
              Hablemos de <span className="vd-grad-1">tu proyecto</span>
            </h2>
            <p>
              Cotización gratuita en menos de 24 horas. Pago único, sin mensualidades ocultas.
            </p>
          </div>

          <form className="vd-form vd-reveal" onSubmit={handleSubmit}>
            {selected.length > 0 && (
              <div>
                <div className="vd-label">Servicios seleccionados:</div>
                <div className="vd-selected-pills">
                  {selected.map((s) => <span key={s} className="vd-pill">{s}</span>)}
                </div>
              </div>
            )}
            <div className="vd-form-grid">
              <div className="vd-form-row">
                <div>
                  <label className="vd-label">Nombre completo</label>
                  <input className="vd-input" name="name" value={form.name} onChange={handleChange} placeholder="Tu nombre" />
                </div>
                <div>
                  <label className="vd-label">Correo</label>
                  <input className="vd-input" name="email" type="email" value={form.email} onChange={handleChange} placeholder="tu@correo.com" />
                </div>
              </div>
              <div className="vd-form-row">
                <div>
                  <label className="vd-label">WhatsApp (opcional)</label>
                  <input className="vd-input" name="phone" value={form.phone} onChange={handleChange} placeholder="+506 8888-8888" />
                </div>
                <div>
                  <label className="vd-label">Presupuesto aproximado</label>
                  <select className="vd-select" name="budget" value={form.budget} onChange={handleChange}>
                    <option value="">Selecciona...</option>
                    <option value="0-200k">Menos de ₡200.000</option>
                    <option value="200-500k">₡200.000 - ₡500.000</option>
                    <option value="500k-1M">₡500.000 - ₡1.000.000</option>
                    <option value="1M+">Más de ₡1.000.000</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="vd-label">Cuéntanos sobre tu proyecto</label>
                <textarea className="vd-textarea" name="message" value={form.message} onChange={handleChange} placeholder="Describe brevemente lo que necesitas..." />
              </div>
              <button type="submit" className="vd-btn vd-btn-primary" disabled={loading} style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}>
                {loading ? "Enviando..." : "Enviar consulta"} <span className="vd-btn-arrow">→</span>
              </button>
            </div>
          </form>
        </section>

        {/* FOOTER */}
        <footer className="vd-footer">
          <div className="vd-container">
            <div className="vd-footer-links">
              <a href="https://www.credly.com/users/allan-leal" target="_blank" rel="noopener noreferrer">Google Cloud Certified</a>
              <a href="https://github.com/AllanLeal11" target="_blank" rel="noopener noreferrer">GitHub</a>
              <a href={ARIA_URL} target="_blank" rel="noopener noreferrer">Demo Aria</a>
              <a href="mailto:allanleal65@gmail.com">contacto@verticedigital.space</a>
              <a href="https://wa.me/50687518055" target="_blank" rel="noopener noreferrer">WhatsApp</a>
            </div>
            <div>
              © {new Date().getFullYear()} Vértice Digital · Hecho con 💚 en Liberia, Guanacaste
            </div>
          </div>
        </footer>
      </div>

      {/* ARIA FAB */}
      <button className="vd-aria-fab" onClick={() => setAriaOpen((v) => !v)} aria-label="Hablar con Aria">
        {ariaOpen ? "✕" : "💬"}
      </button>
      {ariaOpen && (
        <div className="vd-aria-frame-popup">
          <iframe src={ARIA_URL} title="Aria" style={{ width: "100%", height: "100%", border: 0 }} />
        </div>
      )}
    </>
  );
};

export default LandingPage;
