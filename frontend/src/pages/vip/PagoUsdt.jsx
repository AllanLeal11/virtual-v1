import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getOrder, confirmCryptoPayment } from "../../lib/vipApi";

const USDT_WALLETS = {
  trc20: { network: "TRON (TRC-20)", address: "TXxxxxYourTronAddressHere", fee: "$1 USD" },
  bep20: { network: "BSC (BEP-20)", address: "0xxxxxYourBscAddressHere", fee: "$0.50 USD" },
  polygon: { network: "Polygon (MATIC)", address: "0xxxxxYourPolygonHere", fee: "$0.10 USD" },
};

const styles = `
  .vip-pay { min-height: 100vh; background: linear-gradient(180deg, #0a0a0f 0%, #14141f 100%); color: #f0f0f8; font-family: 'DM Sans', sans-serif; padding: 40px 20px; }
  .vip-pay-container { max-width: 600px; margin: 0 auto; }
  .vip-pay h1 { font-family: 'Syne', sans-serif; font-size: 32px; margin-bottom: 8px; }
  .vip-pay-subtitle { color: #6b6b8a; margin-bottom: 32px; }
  .vip-pay-card { background: #12121a; border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 28px; margin-bottom: 16px; }
  .vip-network-tabs { display: flex; gap: 8px; margin-bottom: 20px; }
  .vip-network-tab {
    flex: 1; padding: 10px 14px; background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08); border-radius: 10px;
    color: #c0c0d0; cursor: pointer; text-align: center; font-size: 13px;
    transition: all 0.2s;
  }
  .vip-network-tab.selected { border-color: #00e5a0; background: rgba(0,229,160,0.1); color: #00e5a0; }
  .vip-info-box {
    background: rgba(0,229,160,0.06); border: 1px solid rgba(0,229,160,0.2);
    border-radius: 12px; padding: 18px; margin: 16px 0;
  }
  .vip-info-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; }
  .vip-info-label { color: #6b6b8a; font-size: 13px; }
  .vip-address {
    background: #0a0a0f; padding: 14px; border-radius: 10px; margin: 8px 0;
    font-family: monospace; font-size: 13px; word-break: break-all;
    border: 1px solid rgba(255,255,255,0.08); cursor: pointer;
    color: #00e5a0;
  }
  .vip-amount {
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: 32px;
    color: #00e5a0; text-align: center; margin: 16px 0;
  }
  .vip-form-group { margin-bottom: 16px; }
  .vip-form-group label { display: block; font-size: 13px; color: #6b6b8a; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
  .vip-form-group input {
    width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px; padding: 12px 14px; color: #f0f0f8; font-size: 15px;
    outline: none; box-sizing: border-box; font-family: monospace;
  }
  .vip-cta {
    width: 100%; padding: 16px;
    background: linear-gradient(135deg, #00e5a0, #00b88a);
    color: #0a0a0f; border: none; border-radius: 12px;
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px;
    cursor: pointer; text-transform: uppercase;
  }
  .vip-cta:disabled { opacity: 0.5; cursor: not-allowed; }
  .vip-warning {
    background: rgba(251, 191, 36, 0.08); border: 1px solid rgba(251, 191, 36, 0.3);
    border-radius: 10px; padding: 12px; font-size: 13px; color: #fbbf24; margin: 12px 0;
  }
`;

export default function PagoUsdt() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [network, setNetwork] = useState("trc20");
  const [txHash, setTxHash] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getOrder(orderId).then(setOrder).catch(() => toast.error("Orden no encontrada"));
  }, [orderId]);

  const wallet = USDT_WALLETS[network];

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!txHash.trim()) return toast.error("Pegá el hash de la transacción");
    setLoading(true);
    try {
      await confirmCryptoPayment(orderId, { txHash });
      toast.success("Pago en validación on-chain");
      navigate(`/vip/confirmacion/${orderId}`);
    } catch (err) {
      toast.error(err.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  if (!order) return <div className="vip-pay"><div className="vip-pay-container">Cargando…</div></div>;

  return (
    <div className="vip-pay">
      <style>{styles}</style>
      <div className="vip-pay-container">
        <h1>🪙 Pago vía USDT</h1>
        <p className="vip-pay-subtitle">
          Enviá USDT desde Binance, Trust Wallet, MetaMask o cualquier exchange/wallet.
        </p>

        <div className="vip-pay-card">
          <h3 style={{ marginBottom: 12 }}>1. Elegí la red</h3>
          <div className="vip-network-tabs">
            {Object.entries(USDT_WALLETS).map(([key, w]) => (
              <div
                key={key}
                className={`vip-network-tab${network === key ? " selected" : ""}`}
                onClick={() => setNetwork(key)}
              >
                <strong>{w.network.split(" ")[0]}</strong>
                <div style={{ fontSize: 11, marginTop: 2, opacity: 0.7 }}>fee {w.fee}</div>
              </div>
            ))}
          </div>

          <div className="vip-warning">
            ⚠️ Importante: enviá SOLO en la red {wallet.network}. Otras redes resultan en pérdida total de fondos.
          </div>

          <h3 style={{ marginTop: 20, marginBottom: 8 }}>2. Enviá este monto exacto</h3>
          <div className="vip-amount">${order.amount_usd} USDT</div>

          <h3 style={{ marginBottom: 8 }}>3. A esta dirección</h3>
          <div className="vip-info-box">
            <div className="vip-info-row">
              <span className="vip-info-label">Red</span>
              <span style={{ color: "#f0f0f8" }}>{wallet.network}</span>
            </div>
            <div className="vip-address" onClick={() => copy(wallet.address)}>
              {wallet.address} 📋
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <h3 style={{ marginTop: 20, marginBottom: 8 }}>4. Pegá el hash de la transacción</h3>
            <p style={{ color: "#6b6b8a", fontSize: 13, marginBottom: 12 }}>
              Después de enviar, copiá el "Transaction Hash" o "TXID" de tu wallet/exchange.
            </p>
            <div className="vip-form-group">
              <input
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                placeholder="0x... o T..."
                required
              />
            </div>
            <button className="vip-cta" disabled={loading} type="submit">
              {loading ? "Validando..." : "Confirmar pago crypto"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
