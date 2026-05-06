import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getOrder } from "../../lib/vipApi";

const PAYPAL_ME = "https://paypal.me/AllanLeal11";

const styles = `
  .vip-pay { min-height: 100vh; background: linear-gradient(180deg, #0a0a0f 0%, #14141f 100%); color: #f0f0f8; font-family: 'DM Sans', sans-serif; padding: 40px 20px; }
  .vip-pay-container { max-width: 600px; margin: 0 auto; }
  .vip-pay h1 { font-family: 'Syne', sans-serif; font-size: 32px; margin-bottom: 8px; }
  .vip-pay-subtitle { color: #6b6b8a; margin-bottom: 32px; }
  .vip-pay-card { background: #12121a; border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 28px; margin-bottom: 16px; }
  .vip-paypal-logo { background: #ffc439; color: #003087; font-weight: 800; font-size: 28px; padding: 16px 32px; border-radius: 12px; display: inline-block; font-family: 'Syne', sans-serif; }
  .vip-amount { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 48px; color: #00e5a0; text-align: center; margin: 24px 0 8px; }
  .vip-amount-note { color: #6b6b8a; text-align: center; margin-bottom: 24px; font-size: 13px; }
  .vip-cta { width: 100%; padding: 18px; background: linear-gradient(135deg, #003087, #009cde); color: white; border: none; border-radius: 12px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 18px; cursor: pointer; text-transform: uppercase; text-decoration: none; display: block; text-align: center; }
  .vip-cta-secondary { width: 100%; padding: 14px; background: transparent; color: #6b6b8a; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; font-size: 14px; cursor: pointer; margin-top: 12px; }
  .vip-step { display: flex; gap: 14px; margin: 16px 0; align-items: flex-start; }
  .vip-step-num { width: 28px; height: 28px; border-radius: 50%; background: rgba(0,229,160,0.2); color: #00e5a0; font-weight: 700; display: flex; align-items: center; justify-content: center; font-size: 13px; flex-shrink: 0; }
  .vip-step-text { font-size: 14px; color: #c0c0d0; line-height: 1.5; flex: 1; }
`;

export default function PagoPaypal() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    getOrder(orderId).then(setOrder).catch(() => toast.error("Orden no encontrada"));
  }, [orderId]);

  if (!order) return <div className="vip-pay"><div className="vip-pay-container">Cargando…</div></div>;

  const paypalUrl = `${PAYPAL_ME}/${order.amount_usd}USD`;
  const note = `VIP-${order.id?.slice(-6)}`;

  return (
    <div className="vip-pay">
      <style>{styles}</style>
      <div className="vip-pay-container">
        <h1>💳 Pago vía PayPal</h1>
        <p className="vip-pay-subtitle">
          Pagá con tarjeta de crédito o débito de cualquier país. Procesado por PayPal.
        </p>

        <div className="vip-pay-card" style={{ textAlign: "center" }}>
          <div className="vip-paypal-logo">PayPal</div>
          <div className="vip-amount">${order.amount_usd}</div>
          <div className="vip-amount-note">USD · Plan {order.plan?.toUpperCase()}</div>

          <a href={paypalUrl} target="_blank" rel="noopener noreferrer" className="vip-cta">
            Pagar ${order.amount_usd} con PayPal →
          </a>

          <div style={{ textAlign: "left", marginTop: 28 }}>
            <h3 style={{ marginBottom: 12, fontSize: 16 }}>Pasos:</h3>
            <div className="vip-step">
              <div className="vip-step-num">1</div>
              <div className="vip-step-text">Click en "Pagar con PayPal" arriba.</div>
            </div>
            <div className="vip-step">
              <div className="vip-step-num">2</div>
              <div className="vip-step-text">
                En el campo de "nota/concepto" pegá: <strong style={{ color: "#00e5a0" }}>{note}</strong>
              </div>
            </div>
            <div className="vip-step">
              <div className="vip-step-num">3</div>
              <div className="vip-step-text">Completá el pago con tu tarjeta o cuenta PayPal.</div>
            </div>
            <div className="vip-step">
              <div className="vip-step-num">4</div>
              <div className="vip-step-text">Volvé a esta página y confirmá abajo.</div>
            </div>
          </div>

          <button
            className="vip-cta-secondary"
            onClick={() => navigate(`/vip/confirmacion/${orderId}`)}
          >
            Ya pagué, continuar →
          </button>
        </div>

        <div style={{ textAlign: "center", color: "#6b6b8a", fontSize: 13, marginTop: 16 }}>
          Tu acceso se activa automáticamente al confirmarse el pago en PayPal (1-2 min).
        </div>
      </div>
    </div>
  );
}
