import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getOrder, uploadSinpeProof } from "../../lib/vipApi";

const SINPE_NUMBER = "8751-8055";
const SINPE_NAME = "Allan Leal · Vértice Digital";

const styles = `
  .vip-pay {
    min-height: 100vh;
    background: linear-gradient(180deg, #0a0a0f 0%, #14141f 100%);
    color: #f0f0f8;
    font-family: 'DM Sans', sans-serif;
    padding: 40px 20px;
  }
  .vip-pay-container { max-width: 600px; margin: 0 auto; }
  .vip-pay h1 {
    font-family: 'Syne', sans-serif;
    font-size: 32px;
    margin-bottom: 8px;
  }
  .vip-pay-subtitle { color: #6b6b8a; margin-bottom: 32px; }
  .vip-pay-card {
    background: #12121a;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    padding: 28px;
    margin-bottom: 16px;
  }
  .vip-step {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    margin-bottom: 18px;
  }
  .vip-step-num {
    width: 32px; height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #00e5a0, #00b88a);
    color: #0a0a0f;
    font-weight: 800;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .vip-step-content { flex: 1; }
  .vip-step-content h3 { font-size: 16px; margin-bottom: 4px; color: #f0f0f8; }
  .vip-step-content p { font-size: 14px; color: #c0c0d0; line-height: 1.5; }
  .vip-info-box {
    background: rgba(0,229,160,0.06);
    border: 1px solid rgba(0,229,160,0.2);
    border-radius: 12px;
    padding: 18px;
    margin: 16px 0;
    display: flex; flex-direction: column; gap: 8px;
  }
  .vip-info-row { display: flex; justify-content: space-between; align-items: center; }
  .vip-info-label { color: #6b6b8a; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
  .vip-info-value {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    color: #00e5a0;
    font-size: 18px;
    cursor: pointer;
  }
  .vip-form-group { margin-bottom: 16px; }
  .vip-form-group label { display: block; font-size: 13px; color: #6b6b8a; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
  .vip-form-group input {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    padding: 12px 14px;
    color: #f0f0f8;
    font-size: 15px;
    outline: none;
    box-sizing: border-box;
  }
  .vip-form-group input[type=file] { padding: 10px; }
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
    text-transform: uppercase;
  }
  .vip-cta:disabled { opacity: 0.5; cursor: not-allowed; }
`;

export default function PagoSinpe() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [reference, setReference] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getOrder(orderId)
      .then(setOrder)
      .catch(() => toast.error("Orden no encontrada"));
  }, [orderId]);

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado al portapapeles");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reference.trim()) return toast.error("Ingresá la referencia SINPE");

    setLoading(true);
    try {
      await uploadSinpeProof(orderId, { reference, screenshot });
      toast.success("Comprobante enviado");
      navigate(`/vip/confirmacion/${orderId}`);
    } catch (err) {
      toast.error(err.message || "Error al enviar");
    } finally {
      setLoading(false);
    }
  };

  if (!order) return <div className="vip-pay"><div className="vip-pay-container">Cargando…</div></div>;

  const amount = order.amount_crc || 0;

  return (
    <div className="vip-pay">
      <style>{styles}</style>
      <div className="vip-pay-container">
        <h1>🇨🇷 Pago vía SINPE Móvil</h1>
        <p className="vip-pay-subtitle">
          Transferí desde tu app bancaria y subí el comprobante. Tu acceso se activa al confirmar.
        </p>

        <div className="vip-pay-card">
          <div className="vip-step">
            <div className="vip-step-num">1</div>
            <div className="vip-step-content">
              <h3>Hacé el SINPE Móvil al siguiente número:</h3>
              <div className="vip-info-box">
                <div className="vip-info-row">
                  <span className="vip-info-label">Número</span>
                  <span className="vip-info-value" onClick={() => copy(SINPE_NUMBER)}>
                    {SINPE_NUMBER} 📋
                  </span>
                </div>
                <div className="vip-info-row">
                  <span className="vip-info-label">A nombre de</span>
                  <span style={{ color: "#f0f0f8", fontSize: 14 }}>{SINPE_NAME}</span>
                </div>
                <div className="vip-info-row">
                  <span className="vip-info-label">Monto exacto</span>
                  <span className="vip-info-value" onClick={() => copy(String(amount))}>
                    ₡{amount.toLocaleString()} 📋
                  </span>
                </div>
                <div className="vip-info-row">
                  <span className="vip-info-label">Concepto</span>
                  <span className="vip-info-value" onClick={() => copy(`VIP-${order.id?.slice(-6)}`)}>
                    VIP-{order.id?.slice(-6)} 📋
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="vip-step">
            <div className="vip-step-num">2</div>
            <div className="vip-step-content">
              <h3>Pegá la referencia que te dio el banco</h3>
              <p>La encontrás en el SMS/notificación del SINPE.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ marginLeft: 46 }}>
            <div className="vip-form-group">
              <label>Referencia SINPE</label>
              <input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Ej: 1234567890"
                required
              />
            </div>
            <div className="vip-form-group">
              <label>Captura del comprobante (opcional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
              />
            </div>
            <button className="vip-cta" disabled={loading} type="submit">
              {loading ? "Enviando..." : "Confirmar pago"}
            </button>
          </form>
        </div>

        <div style={{ textAlign: "center", color: "#6b6b8a", fontSize: 13, marginTop: 16 }}>
          Tu pago se valida manualmente en menos de 2 horas hábiles.<br/>
          Te avisamos por WhatsApp al {order.phone} cuando esté listo.
        </div>
      </div>
    </div>
  );
}
