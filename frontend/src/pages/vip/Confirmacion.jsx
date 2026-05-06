import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getOrder } from "../../lib/vipApi";

const styles = `
  .vip-conf { min-height: 100vh; background: linear-gradient(180deg, #0a0a0f 0%, #14141f 100%); color: #f0f0f8; font-family: 'DM Sans', sans-serif; padding: 40px 20px; display: flex; align-items: center; justify-content: center; }
  .vip-conf-container { max-width: 540px; width: 100%; text-align: center; }
  .vip-conf-icon { font-size: 80px; margin-bottom: 16px; }
  .vip-conf h1 { font-family: 'Syne', sans-serif; font-size: 36px; margin-bottom: 12px; background: linear-gradient(135deg, #00e5a0, #7b5ea7); -webkit-background-clip: text; background-clip: text; color: transparent; }
  .vip-conf p { color: #c0c0d0; font-size: 16px; line-height: 1.6; margin-bottom: 12px; }
  .vip-conf-card { background: #12121a; border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 32px; margin: 24px 0; }
  .vip-status { display: inline-block; padding: 8px 20px; border-radius: 999px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
  .vip-status.pending { background: rgba(251, 191, 36, 0.15); color: #fbbf24; }
  .vip-status.paid { background: rgba(0,229,160,0.15); color: #00e5a0; }
  .vip-cta { padding: 14px 32px; background: linear-gradient(135deg, #00e5a0, #00b88a); color: #0a0a0f; border: none; border-radius: 12px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; cursor: pointer; text-transform: uppercase; text-decoration: none; display: inline-block; }
  .vip-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 20px 0; text-align: left; }
  .vip-info-item { background: rgba(255,255,255,0.04); padding: 12px; border-radius: 10px; }
  .vip-info-item-label { font-size: 11px; color: #6b6b8a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
  .vip-info-item-value { font-size: 14px; color: #f0f0f8; font-weight: 500; }
`;

export default function Confirmacion() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [polling, setPolling] = useState(true);

  useEffect(() => {
    let interval;
    const check = () => {
      getOrder(orderId).then((o) => {
        setOrder(o);
        if (o.status === "paid" && o.access_token) {
          localStorage.setItem("vd_vip_token", o.access_token);
          setPolling(false);
          clearInterval(interval);
        }
      }).catch(() => {});
    };
    check();
    interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  }, [orderId]);

  if (!order) return <div className="vip-conf"><div className="vip-conf-container">Cargando…</div></div>;

  const isPaid = order.status === "paid";

  return (
    <div className="vip-conf">
      <style>{styles}</style>
      <div className="vip-conf-container">
        <div className="vip-conf-icon">{isPaid ? "🎉" : "⏳"}</div>
        <h1>{isPaid ? "¡Pago confirmado!" : "Validando tu pago..."}</h1>
        <p>
          {isPaid
            ? "Tu acceso a WhatsApp VIP está activo. Configurá tu bot ahora."
            : `Estamos verificando tu pago. ${polling ? "Esto se actualiza automáticamente." : ""}`}
        </p>

        <div className="vip-conf-card">
          <span className={`vip-status ${isPaid ? "paid" : "pending"}`}>
            {isPaid ? "✓ Confirmado" : "Pendiente"}
          </span>

          <div className="vip-info-grid">
            <div className="vip-info-item">
              <div className="vip-info-item-label">Plan</div>
              <div className="vip-info-item-value">{order.plan?.toUpperCase()}</div>
            </div>
            <div className="vip-info-item">
              <div className="vip-info-item-label">Método</div>
              <div className="vip-info-item-value">{order.method?.toUpperCase()}</div>
            </div>
            <div className="vip-info-item">
              <div className="vip-info-item-label">Email</div>
              <div className="vip-info-item-value" style={{ fontSize: 12 }}>{order.email}</div>
            </div>
            <div className="vip-info-item">
              <div className="vip-info-item-label">WhatsApp</div>
              <div className="vip-info-item-value" style={{ fontSize: 13 }}>{order.phone}</div>
            </div>
          </div>

          {isPaid ? (
            <a href="/vip/configuracion" className="vip-cta">
              Configurar mi bot →
            </a>
          ) : (
            <p style={{ color: "#6b6b8a", fontSize: 13, margin: 0 }}>
              Validación tarda: SINPE 1-2h hábiles · PayPal/USDT 2-15 min<br/>
              Te avisaremos por WhatsApp al {order.phone}
            </p>
          )}
        </div>

        <p style={{ fontSize: 13, color: "#6b6b8a" }}>
          ¿Problemas? Escribinos: <a href="https://wa.me/50687518055" style={{ color: "#00e5a0" }}>+506 8751-8055</a>
        </p>
      </div>
    </div>
  );
}
