import React, { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SERVICES = [
  { key: "Sitios Web", icon: "🌐", name: "Sitios Web", desc: "Diseño y desarrollo de páginas web profesionales, responsivas y optimizadas para SEO.", priceLabel: "₡150,000 – ₡600,000", min: 150000, max: 600000, features: ["Diseño personalizado", "Responsive", "SEO optimizado", "Panel admin"] },
  { key: "Guanacaste Concierge", icon: "🏨", name: "Concierge AI", desc: "Asistente inteligente para hoteles que gestiona reservas y dudas de huéspedes 24/7.", priceLabel: "Suscripción", min: 0, max: null, quote: true, features: ["FastAPI+OpenAI", "Integración Web", "Multilingüe", "Panel de control"] },
  { key: "WhatsApp Bot", icon: "💬", name: "WhatsApp Bot", desc: "Automatiza tu atención al cliente con bots inteligentes para WhatsApp Business.", priceLabel: "₡200,000", min: 200000, max: null, features: ["Respuestas automáticas", "Catálogo de productos", "Atención 24/7", "Integración WhatsApp Business"] },
  { key: "AirBnB Hub", icon: "🏠", name: "AirBnB Automation", desc: "Automatización total para anfitriones. Gestión de check-ins, guías digitales inteligentes y comunicación automática con huéspedes.", priceLabel: "Consultar", min: 0, max: null, quote: true, features: ["Check-in digital", "Guías interactivas", "Sync con calendarios", "IA Concierge"] },
  { key: "E-commerce Pro", icon: "🛍️", name: "E-commerce Local", desc: "Lleve sus productos de Guanacaste a todo el mundo. Tiendas online rápidas, seguras y optimizadas para móviles.", priceLabel: "Desde ₡250,000", min: 250000, max: null, features: ["Pagos con tarjeta/SINPE", "Gestión de inventario", "SEO para productos", "Diseño Premium"] },
  { key: "Sistema POS", icon: "🛒", name: "Sistema POS", desc: "Punto de venta moderno para gestionar tu negocio de forma eficiente.", priceLabel: "₡400,000", min: 400000, max: null, features: ["Inventario", "Ventas", "Reportes", "Multi-sucursal"] },
  { key: "Automatizaciones", icon: "⚡", name: "Automatizaciones", desc: "Optimiza tus procesos con flujos automatizados y conexiones entre sistemas.", priceLabel: "Cotización", min: 0, max: null, quote: true, features: ["n8n workflows", "Integraciones API", "Notificaciones", "Reportes auto"] },
];