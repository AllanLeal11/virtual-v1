/**
 * Cliente API para WhatsApp VIP SaaS
 * Maneja órdenes de pago, configuración del bot y autenticación con tokens mágicos.
 */

const BACKEND = process.env.REACT_APP_BACKEND_URL || "";
const API = `${BACKEND}/api/vip`;

// ============== ÓRDENES DE PAGO ==============

export async function createOrder({ plan, method, email, phone }) {
  const r = await fetch(`${API}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan, method, email, phone }),
  });
  if (!r.ok) throw new Error("Error al crear orden");
  return r.json();
}

export async function getOrder(orderId) {
  const r = await fetch(`${API}/orders/${orderId}`);
  if (!r.ok) throw new Error("Orden no encontrada");
  return r.json();
}

export async function uploadSinpeProof(orderId, { reference, screenshot }) {
  const fd = new FormData();
  fd.append("reference", reference);
  if (screenshot) fd.append("screenshot", screenshot);
  const r = await fetch(`${API}/orders/${orderId}/sinpe`, {
    method: "POST",
    body: fd,
  });
  if (!r.ok) throw new Error("Error al subir comprobante");
  return r.json();
}

export async function confirmCryptoPayment(orderId, { txHash }) {
  const r = await fetch(`${API}/orders/${orderId}/crypto`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tx_hash: txHash }),
  });
  if (!r.ok) throw new Error("Error al confirmar pago");
  return r.json();
}

// ============== TOKEN MÁGICO / AUTH ==============

export function setVipToken(token) {
  localStorage.setItem("vd_vip_token", token);
}
export function getVipToken() {
  return localStorage.getItem("vd_vip_token");
}
export function clearVipToken() {
  localStorage.removeItem("vd_vip_token");
}

async function authedFetch(path, options = {}) {
  const token = getVipToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const r = await fetch(`${API}${path}`, { ...options, headers });
  if (r.status === 401) {
    clearVipToken();
    throw new Error("Sesión expirada");
  }
  if (!r.ok) throw new Error((await r.text()) || "Error en API");
  return r.json();
}

// ============== CONFIGURACIÓN DEL BOT ==============

export const me = () => authedFetch("/me");

export const getBotConfig = () => authedFetch("/bot/config");

export const updateBotConfig = (config) =>
  authedFetch("/bot/config", { method: "PUT", body: JSON.stringify(config) });

export const listResponses = () => authedFetch("/bot/responses");

export const createResponse = (data) =>
  authedFetch("/bot/responses", { method: "POST", body: JSON.stringify(data) });

export const updateResponse = (id, data) =>
  authedFetch(`/bot/responses/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deleteResponse = (id) =>
  authedFetch(`/bot/responses/${id}`, { method: "DELETE" });

export const getStats = () => authedFetch("/bot/stats");

// ============== PLANES (constantes compartidas) ==============

export const PLANS = {
  starter: { name: "Básico", price: 29, period: "mes", priceUSD: 29, conversations: 1000 },
  pro: { name: "Pro", price: 59, period: "mes", priceUSD: 59, conversations: 5000 },
  premium: { name: "Premium", price: 149, period: "mes", priceUSD: 149, conversations: -1 },
};

export const PAYMENT_METHODS = {
  sinpe: {
    name: "SINPE Móvil",
    icon: "🇨🇷",
    description: "Transferencia desde cualquier banco de Costa Rica",
    instant: false,
  },
  paypal: {
    name: "PayPal",
    icon: "💳",
    description: "Tarjeta de crédito/débito vía PayPal (internacional)",
    instant: true,
  },
  usdt: {
    name: "USDT (Crypto)",
    icon: "🪙",
    description: "Tether USD vía Binance, Trust Wallet o cualquier exchange",
    instant: true,
  },
};
