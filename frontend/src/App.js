import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Checkout from "./pages/vip/Checkout";
import PagoSinpe from "./pages/vip/PagoSinpe";
import PagoPaypal from "./pages/vip/PagoPaypal";
import PagoUsdt from "./pages/vip/PagoUsdt";
import Confirmacion from "./pages/vip/Confirmacion";
import Configuracion from "./pages/vip/Configuracion";
import AdminVip from "./pages/vip/AdminVip";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard/*" element={<AdminDashboard />} />

          {/* WhatsApp VIP SaaS */}
          <Route path="/vip/checkout" element={<Checkout />} />
          <Route path="/vip/pago/sinpe/:orderId" element={<PagoSinpe />} />
          <Route path="/vip/pago/paypal/:orderId" element={<PagoPaypal />} />
          <Route path="/vip/pago/usdt/:orderId" element={<PagoUsdt />} />
          <Route path="/vip/confirmacion/:orderId" element={<Confirmacion />} />
          <Route path="/vip/configuracion" element={<Configuracion />} />
          <Route path="/vip/admin" element={<AdminVip />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
