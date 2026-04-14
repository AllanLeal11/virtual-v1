import React, { useState, useEffect } from "react";
import { Menu, X, MessageCircle, Globe, FileText, ShoppingCart, Zap, ChevronRight, Phone, Mail, MapPin, Users, Clock, DollarSign, Check, Calculator, CalendarDays, Star, XCircle } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SERVICES = [
  { icon: Globe, title: "Sitios Web", description: "Diseño y desarrollo de páginas web profesionales, responsivas y optimizadas para SEO.", price: "₡150,000 - ₡600,000", basePrice: 150000, features: ["Diseño personalizado", "Responsive", "SEO optimizado", "Panel admin"] },
  { icon: MessageCircle, title: "WhatsApp Bot", description: "Automatiza tu atención al cliente con bots inteligentes para WhatsApp Business.", price: "₡200,000", basePrice: 200000, features: ["Respuestas automáticas", "Catálogo productos", "Reservas online", "24/7 disponible"] },
  { icon: FileText, title: "Facturación Electrónica", description: "Sistema completo de facturación electrónica integrado con Hacienda Costa Rica.", price: "₡150,000", basePrice: 150000, features: ["Integración Hacienda", "Facturas y notas", "Reportes", "Multi-usuario"] },
  { icon: ShoppingCart, title: "Sistema POS", description: "Punto de venta moderno para gestionar tu negocio de forma eficiente.", price: "₡400,000", basePrice: 400000, features: ["Inventario", "Ventas", "Reportes", "Multi-sucursal"] },
  { icon: Zap, title: "Automatizaciones", description: "Optimiza tus procesos con flujos automatizados y conexiones entre sistemas.", price: "Cotización", basePrice: 100000, features: ["n8n workflows", "Integraciones API", "Notificaciones", "Reportes auto"] }
];

const WHY_US = [
  { icon: MapPin, title: "Somos Locales", description: "Ubicados en Liberia, Guanacaste. Conocemos el mercado local y sus necesidades." },
  { icon: Users, title: "Soporte Presencial", description: "Visitas técnicas, capacitaciones y soporte en persona cuando lo necesites." },
  { icon: DollarSign, title: "Precios en Colones", description: "Sin sorpresas por tipo de cambio. Todos nuestros precios en moneda local." },
  { icon: Clock, title: "Entrega Rápida", description: "Proyectos ágiles con entregas en semanas, no meses." }
];

const TESTIMONIALS = [
  { name: "María Fernández", business: "Restaurante El Sabor Tico", text: "Vértice Digital nos hizo el sitio web y el sistema POS. Las ventas aumentaron un 35% en el primer mes. ¡Excelente servicio!", rating: 5, avatar: "MF" },
  { name: "Roberto Jiménez", business: "Ferretería Guanacaste", text: "El bot de WhatsApp nos ahorra 4 horas diarias. Los clientes hacen pedidos solos y nosotros solo despachamos. Increíble.", rating: 5, avatar: "RJ" },
  { name: "Ana Lucía Mora", business: "Clínica Dental Liberia", text: "La facturación electrónica fue un dolor de cabeza hasta que Vértice lo resolvió. Ahora todo es automático y cumplimos con Hacienda.", rating: 5, avatar: "AM" }
];

const DEMO_TIMES = [
  "9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", phone: "", service: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  // Calculator state
  const [selectedServices, setSelectedServices] = useState([]);
  const [showCalculator, setShowCalculator] = useState(false);

  // Demo booking state
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoForm, setDemoForm] = useState({ name: "", phone: "", date: "", time: "", business: "" });

  // Exit popup state
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [exitPopupShown, setExitPopupShown] = useState(false);

  // Exit intent detection
  useEffect(() => {
    const handleMouseLeave = (e) => {
      if (e.clientY <= 0 && !exitPopupShown) {
        setShowExitPopup(true);
        setExitPopupShown(true);
      }
    };
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [exitPopupShown]);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await axios.post(`${API}/contact`, contactForm);
      toast.success("¡Mensaje enviado! Te contactaremos pronto.");
      window.open(response.data.whatsapp_redirect, "_blank");
      setContactForm({ name: "", email: "", phone: "", service: "", message: "" });
    } catch (error) {
      toast.error("Error al enviar. Intenta de nuevo.");
    }
    setSubmitting(false);
  };

  const handleDemoSubmit = (e) => {
    e.preventDefault();
    const msg = `Hola, soy ${demoForm.name} de ${demoForm.business}. Quiero agendar una demostración para el ${demoForm.date} a las ${demoForm.time}.`;
    window.open(`https://wa.me/50687518055?text=${encodeURIComponent(msg)}`, "_blank");
    toast.success("¡Solicitud enviada por WhatsApp!");
    setShowDemoModal(false);
    setDemoForm({ name: "", phone: "", date: "", time: "", business: "" });
  };

  const toggleService = (index) => {
    setSelectedServices(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const totalPrice = selectedServices.reduce((sum, i) => sum + SERVICES[i].basePrice, 0);
  const discountedPrice = selectedServices.length >= 3 ? Math.round(totalPrice * 0.85) : selectedServices.length >= 2 ? Math.round(totalPrice * 0.9) : totalPrice;
  const discount = selectedServices.length >= 3 ? 15 : selectedServices.length >= 2 ? 10 : 0;

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  const formatPrice = (n) => "₡" + n.toLocaleString("es-CR");

  return (
    <div className="min-h-screen bg-[#0d1b2a]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#f0a500] rounded flex items-center justify-center">
                <span className="font-bold text-[#0d1b2a] text-xl font-['Syne']">V</span>
              </div>
              <span className="font-bold text-xl text-[#e2e8f0] font-['Syne']">Vértice Digital</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              {[["servicios","Servicios"],["calculadora","Cotizador"],["nosotros","Nosotros"],["testimonios","Clientes"],["contacto","Contacto"]].map(([id,label]) => (
                <button key={id} onClick={() => scrollToSection(id)} className="text-[#8892a4] hover:text-[#f0a500] transition-colors" data-testid={`nav-${id}`}>{label}</button>
              ))}
              <a href="/admin" className="text-[#8892a4] hover:text-[#f0a500] transition-colors" data-testid="nav-admin">Admin</a>
            </nav>
            <button className="md:hidden text-[#e2e8f0]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} data-testid="mobile-menu-toggle">
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#16213e] border-t border-white/10 px-4 py-4 space-y-3">
            {[["servicios","Servicios"],["calculadora","Cotizador"],["nosotros","Nosotros"],["testimonios","Clientes"],["contacto","Contacto"]].map(([id,label]) => (
              <button key={id} onClick={() => scrollToSection(id)} className="block w-full text-left text-[#e2e8f0] hover:text-[#f0a500] py-2">{label}</button>
            ))}
            <a href="/admin" className="block text-[#e2e8f0] hover:text-[#f0a500] py-2">Admin</a>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(https://static.prod-images.emergentagent.com/jobs/4aa9df6c-ab79-40dc-938e-1b6226649def/images/659a634f6ce30db48400c018a4d382449e9b72b24895d0fd7b5052af30d0b254.png)`, opacity: 0.3 }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d1b2a]/50 via-[#0d1b2a]/70 to-[#0d1b2a]" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fadeIn">
            <p className="text-[#f0a500] text-sm font-semibold tracking-[0.2em] uppercase mb-6">Tecnología para Guanacaste</p>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter text-[#e2e8f0] mb-6 font-['Syne']">Vértice Digital</h1>
            <p className="text-xl sm:text-2xl text-[#8892a4] max-w-2xl mx-auto mb-10">Tecnología que impulsa tu negocio en Guanacaste</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => scrollToSection("calculadora")} className="bg-[#f0a500] text-[#0d1b2a] font-bold px-8 py-4 hover:bg-[#d49100] transition-colors flex items-center justify-center gap-2" data-testid="hero-cta-calculator">
                <Calculator size={20} /> Cotizar Ahora
              </button>
              <button onClick={() => setShowDemoModal(true)} className="border border-[#f0a500] text-[#f0a500] font-bold px-8 py-4 hover:bg-[#f0a500]/10 transition-colors flex items-center justify-center gap-2" data-testid="hero-cta-demo">
                <CalendarDays size={20} /> Agendar Demo
              </button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronRight size={32} className="text-[#f0a500] rotate-90" />
        </div>
      </section>

      {/* Services Section */}
      <section id="servicios" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#f0a500] text-xs font-semibold tracking-[0.2em] uppercase mb-4">Nuestros Servicios</p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#e2e8f0] font-['Syne']">Soluciones Digitales</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICES.map((service, index) => (
              <div key={index} className="service-card bg-[#16213e] border border-white/10 p-8 group" data-testid={`service-card-${index}`}>
                <div className="w-14 h-14 bg-[#f0a500]/10 rounded flex items-center justify-center mb-6 group-hover:bg-[#f0a500]/20 transition-colors">
                  <service.icon className="w-7 h-7 text-[#f0a500]" />
                </div>
                <h3 className="text-xl font-bold text-[#e2e8f0] mb-3 font-['Syne']">{service.title}</h3>
                <p className="text-[#8892a4] mb-4 text-sm leading-relaxed">{service.description}</p>
                <p className="text-[#f0a500] font-bold text-lg mb-4">{service.price}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-[#8892a4]">
                      <Check size={14} className="text-[#f0a500]" /> {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Price Calculator Section */}
      <section id="calculadora" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#16213e]/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#f0a500] text-xs font-semibold tracking-[0.2em] uppercase mb-4">Cotizador Instantáneo</p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#e2e8f0] font-['Syne'] mb-4">Arma tu Paquete</h2>
            <p className="text-[#8892a4]">Selecciona los servicios que necesitas y obtén tu precio al instante</p>
          </div>

          <div className="grid gap-4 mb-8">
            {SERVICES.map((service, index) => (
              <button
                key={index}
                onClick={() => toggleService(index)}
                className={`flex items-center justify-between p-5 rounded border transition-all ${
                  selectedServices.includes(index)
                    ? "bg-[#f0a500]/10 border-[#f0a500] text-[#f0a500]"
                    : "bg-[#0d1b2a] border-white/10 text-[#8892a4] hover:border-[#f0a500]/30"
                }`}
                data-testid={`calc-service-${index}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                    selectedServices.includes(index) ? "border-[#f0a500] bg-[#f0a500]" : "border-[#8892a4]"
                  }`}>
                    {selectedServices.includes(index) && <Check size={14} className="text-[#0d1b2a]" />}
                  </div>
                  <service.icon size={20} />
                  <span className="font-medium text-[#e2e8f0]">{service.title}</span>
                </div>
                <span className="font-bold">{service.price}</span>
              </button>
            ))}
          </div>

          {/* Price summary */}
          {selectedServices.length > 0 && (
            <div className="bg-[#0d1b2a] border border-[#f0a500]/30 rounded p-8 text-center animate-fadeIn">
              {discount > 0 && (
                <div className="inline-block bg-[#f0a500] text-[#0d1b2a] px-4 py-1 rounded-full text-sm font-bold mb-4">
                  {discount}% DESCUENTO por paquete
                </div>
              )}
              {discount > 0 && (
                <p className="text-[#8892a4] line-through text-lg">{formatPrice(totalPrice)}</p>
              )}
              <p className="text-4xl font-black text-[#f0a500] font-['Syne'] my-2">
                {formatPrice(discountedPrice)}
              </p>
              <p className="text-[#8892a4] text-sm mb-6">
                {selectedServices.length} servicio{selectedServices.length > 1 ? "s" : ""} seleccionado{selectedServices.length > 1 ? "s" : ""}
                {selectedServices.length >= 2 && " — ¡Precio especial de paquete!"}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    const services = selectedServices.map(i => SERVICES[i].title).join(", ");
                    const msg = `Hola, me interesa el paquete: ${services}. Precio: ${formatPrice(discountedPrice)}`;
                    window.open(`https://wa.me/50687518055?text=${encodeURIComponent(msg)}`, "_blank");
                  }}
                  className="bg-[#f0a500] text-[#0d1b2a] font-bold px-8 py-3 hover:bg-[#d49100] transition-colors"
                  data-testid="calc-whatsapp-btn"
                >
                  Cotizar por WhatsApp
                </button>
                <button
                  onClick={() => setShowDemoModal(true)}
                  className="border border-[#f0a500] text-[#f0a500] font-bold px-8 py-3 hover:bg-[#f0a500]/10 transition-colors"
                  data-testid="calc-demo-btn"
                >
                  Agendar Demostración
                </button>
              </div>
              <p className="text-[#8892a4] text-xs mt-4">Precio válido por 7 días. Incluye soporte post-entrega.</p>
            </div>
          )}
        </div>
      </section>

      {/* Why Us Section */}
      <section id="nosotros" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[#f0a500] text-xs font-semibold tracking-[0.2em] uppercase mb-4">¿Por qué elegirnos?</p>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#e2e8f0] mb-6 font-['Syne']">Somos de Guanacaste</h2>
              <p className="text-[#8892a4] text-lg mb-8">No somos una empresa de San José que trabaja remotamente. Estamos aquí, en Liberia, listos para visitarte, capacitarte y darte soporte cuando lo necesites.</p>
              <div className="grid grid-cols-2 gap-6">
                {WHY_US.map((item, index) => (
                  <div key={index} className="space-y-3" data-testid={`why-us-${index}`}>
                    <div className="w-12 h-12 bg-[#f0a500]/10 rounded flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-[#f0a500]" />
                    </div>
                    <h3 className="font-bold text-[#e2e8f0] font-['Syne']">{item.title}</h3>
                    <p className="text-[#8892a4] text-sm">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img src="https://images.unsplash.com/photo-1770992161088-7ad66282c9af?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzV8MHwxfHNlYXJjaHwyfHxtb2Rlcm4lMjBkYXJrJTIwb2ZmaWNlJTIwdGVjaCUyMGFnZW5jeXxlbnwwfHx8fDE3NzYxNzQ0NzF8MA&ixlib=rb-4.1.0&q=85" alt="Oficina Vértice Digital" className="rounded-lg border border-white/10" />
              <div className="absolute -bottom-6 -right-6 bg-[#f0a500] p-6 rounded">
                <p className="text-[#0d1b2a] font-bold text-2xl font-['Syne']">5+</p>
                <p className="text-[#0d1b2a] text-sm">años de experiencia</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonios" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#16213e]/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#f0a500] text-xs font-semibold tracking-[0.2em] uppercase mb-4">Casos de Éxito</p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#e2e8f0] font-['Syne']">Clientes Satisfechos</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, index) => (
              <div key={index} className="bg-[#0d1b2a] border border-white/10 p-8 rounded" data-testid={`testimonial-${index}`}>
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={18} className="text-[#f0a500] fill-[#f0a500]" />
                  ))}
                </div>
                <p className="text-[#e2e8f0] mb-6 leading-relaxed italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#f0a500] rounded-full flex items-center justify-center">
                    <span className="text-[#0d1b2a] font-bold text-sm">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <p className="text-[#e2e8f0] font-medium">{testimonial.name}</p>
                    <p className="text-[#8892a4] text-sm">{testimonial.business}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#f0a500] text-xs font-semibold tracking-[0.2em] uppercase mb-4">Portafolio</p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#e2e8f0] font-['Syne']">Nuestro Trabajo</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="group relative overflow-hidden rounded-lg border border-white/10">
              <img src="https://static.prod-images.emergentagent.com/jobs/4aa9df6c-ab79-40dc-938e-1b6226649def/images/d6334e0938ae9d2694f50315656619ca5dafb2904accf9bb9d64bc770498f5f0.png" alt="WhatsApp Bot" className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d1b2a] to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-xl font-bold text-[#e2e8f0] font-['Syne']">WhatsApp Bots</h3>
                <p className="text-[#8892a4] text-sm">Automatización de atención al cliente</p>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-lg border border-white/10">
              <img src="https://static.prod-images.emergentagent.com/jobs/4aa9df6c-ab79-40dc-938e-1b6226649def/images/e3291eb87b1f9a83cf947609dc55115cd96ce0a161bbc00b630958c4c8ccb8a7.png" alt="POS System" className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d1b2a] to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-xl font-bold text-[#e2e8f0] font-['Syne']">Sistemas POS</h3>
                <p className="text-[#8892a4] text-sm">Facturación electrónica integrada</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#16213e]/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <p className="text-[#f0a500] text-xs font-semibold tracking-[0.2em] uppercase mb-4">Contacto</p>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#e2e8f0] mb-6 font-['Syne']">¿Listo para empezar?</h2>
              <p className="text-[#8892a4] text-lg mb-8">Cuéntanos sobre tu proyecto y te contactaremos en menos de 24 horas con una propuesta personalizada.</p>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#f0a500]/10 rounded flex items-center justify-center"><Phone className="w-6 h-6 text-[#f0a500]" /></div>
                  <div><p className="text-[#8892a4] text-sm">Teléfono / WhatsApp</p><a href="tel:+50687518055" className="text-[#e2e8f0] font-semibold hover:text-[#f0a500]">+506 8751-8055</a></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#f0a500]/10 rounded flex items-center justify-center"><Mail className="w-6 h-6 text-[#f0a500]" /></div>
                  <div><p className="text-[#8892a4] text-sm">Email</p><p className="text-[#e2e8f0] font-semibold">info@verticedigital.cr</p></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#f0a500]/10 rounded flex items-center justify-center"><MapPin className="w-6 h-6 text-[#f0a500]" /></div>
                  <div><p className="text-[#8892a4] text-sm">Ubicación</p><p className="text-[#e2e8f0] font-semibold">Liberia, Guanacaste, Costa Rica</p></div>
                </div>
              </div>
            </div>
            <form onSubmit={handleContactSubmit} className="bg-[#16213e] border border-white/10 p-8 space-y-6" data-testid="contact-form">
              <div className="grid sm:grid-cols-2 gap-6">
                <div><label className="block text-[#8892a4] text-sm mb-2">Nombre</label><input type="text" required value={contactForm.name} onChange={(e) => setContactForm({...contactForm, name: e.target.value})} className="w-full bg-[#0d1b2a] border border-white/10 rounded px-4 py-3 text-[#e2e8f0] placeholder-[#8892a4]" placeholder="Tu nombre" data-testid="contact-name" /></div>
                <div><label className="block text-[#8892a4] text-sm mb-2">Email</label><input type="email" required value={contactForm.email} onChange={(e) => setContactForm({...contactForm, email: e.target.value})} className="w-full bg-[#0d1b2a] border border-white/10 rounded px-4 py-3 text-[#e2e8f0] placeholder-[#8892a4]" placeholder="tu@email.com" data-testid="contact-email" /></div>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                <div><label className="block text-[#8892a4] text-sm mb-2">Teléfono</label><input type="tel" required value={contactForm.phone} onChange={(e) => setContactForm({...contactForm, phone: e.target.value})} className="w-full bg-[#0d1b2a] border border-white/10 rounded px-4 py-3 text-[#e2e8f0] placeholder-[#8892a4]" placeholder="+506 0000-0000" data-testid="contact-phone" /></div>
                <div><label className="block text-[#8892a4] text-sm mb-2">Servicio</label><select required value={contactForm.service} onChange={(e) => setContactForm({...contactForm, service: e.target.value})} className="w-full bg-[#0d1b2a] border border-white/10 rounded px-4 py-3 text-[#e2e8f0]" data-testid="contact-service"><option value="">Seleccionar...</option><option value="Sitio Web">Sitio Web</option><option value="WhatsApp Bot">WhatsApp Bot</option><option value="Facturación Electrónica">Facturación Electrónica</option><option value="Sistema POS">Sistema POS</option><option value="Automatizaciones">Automatizaciones</option><option value="Otro">Otro</option></select></div>
              </div>
              <div><label className="block text-[#8892a4] text-sm mb-2">Mensaje</label><textarea required rows={4} value={contactForm.message} onChange={(e) => setContactForm({...contactForm, message: e.target.value})} className="w-full bg-[#0d1b2a] border border-white/10 rounded px-4 py-3 text-[#e2e8f0] placeholder-[#8892a4] resize-none" placeholder="Cuéntanos sobre tu proyecto..." data-testid="contact-message" /></div>
              <button type="submit" disabled={submitting} className="w-full bg-[#f0a500] text-[#0d1b2a] font-bold py-4 hover:bg-[#d49100] transition-colors disabled:opacity-50" data-testid="contact-submit">{submitting ? "Enviando..." : "Enviar Mensaje"}</button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#f0a500] rounded flex items-center justify-center"><span className="font-bold text-[#0d1b2a] text-xl font-['Syne']">V</span></div>
            <span className="font-bold text-xl text-[#e2e8f0] font-['Syne']">Vértice Digital</span>
          </div>
          <p className="text-[#8892a4] text-sm">© 2025 Vértice Digital. Liberia, Guanacaste, Costa Rica.</p>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <a href="https://wa.me/50687518055?text=Hola,%20me%20interesa%20conocer%20más%20sobre%20sus%20servicios" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:bg-[#128C7E] z-40 animate-pulse-whatsapp" data-testid="whatsapp-float-btn">
        <MessageCircle size={28} fill="white" />
      </a>

      {/* Demo Booking Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowDemoModal(false)}>
          <div className="bg-[#16213e] border border-white/10 rounded-lg w-full max-w-md p-8" onClick={(e) => e.stopPropagation()} data-testid="demo-modal">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#e2e8f0] font-['Syne']">Agendar Demostración</h3>
              <button onClick={() => setShowDemoModal(false)} className="text-[#8892a4] hover:text-[#e2e8f0]"><X size={24} /></button>
            </div>
            <form onSubmit={handleDemoSubmit} className="space-y-4">
              <div><label className="block text-[#8892a4] text-sm mb-1">Nombre</label><input type="text" required value={demoForm.name} onChange={(e) => setDemoForm({...demoForm, name: e.target.value})} className="w-full bg-[#0d1b2a] border border-white/10 rounded px-3 py-2 text-[#e2e8f0]" data-testid="demo-name" /></div>
              <div><label className="block text-[#8892a4] text-sm mb-1">Negocio</label><input type="text" required value={demoForm.business} onChange={(e) => setDemoForm({...demoForm, business: e.target.value})} className="w-full bg-[#0d1b2a] border border-white/10 rounded px-3 py-2 text-[#e2e8f0]" data-testid="demo-business" /></div>
              <div><label className="block text-[#8892a4] text-sm mb-1">Teléfono</label><input type="tel" required value={demoForm.phone} onChange={(e) => setDemoForm({...demoForm, phone: e.target.value})} className="w-full bg-[#0d1b2a] border border-white/10 rounded px-3 py-2 text-[#e2e8f0]" data-testid="demo-phone" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-[#8892a4] text-sm mb-1">Fecha</label><input type="date" required value={demoForm.date} onChange={(e) => setDemoForm({...demoForm, date: e.target.value})} className="w-full bg-[#0d1b2a] border border-white/10 rounded px-3 py-2 text-[#e2e8f0]" data-testid="demo-date" /></div>
                <div><label className="block text-[#8892a4] text-sm mb-1">Hora</label><select required value={demoForm.time} onChange={(e) => setDemoForm({...demoForm, time: e.target.value})} className="w-full bg-[#0d1b2a] border border-white/10 rounded px-3 py-2 text-[#e2e8f0]" data-testid="demo-time"><option value="">Seleccionar</option>{DEMO_TIMES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              </div>
              <button type="submit" className="w-full bg-[#f0a500] text-[#0d1b2a] font-bold py-3 hover:bg-[#d49100] transition-colors" data-testid="demo-submit">Solicitar Demo por WhatsApp</button>
            </form>
          </div>
        </div>
      )}

      {/* Exit Intent Popup */}
      {showExitPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-[#16213e] border border-[#f0a500]/30 rounded-lg w-full max-w-lg p-10 text-center relative" data-testid="exit-popup">
            <button onClick={() => setShowExitPopup(false)} className="absolute top-4 right-4 text-[#8892a4] hover:text-[#e2e8f0]"><XCircle size={28} /></button>
            <div className="inline-block bg-[#f0a500] text-[#0d1b2a] px-6 py-2 rounded-full text-sm font-bold mb-6">OFERTA ESPECIAL</div>
            <h3 className="text-2xl font-bold text-[#e2e8f0] font-['Syne'] mb-4">¡Espera! No te vayas sin tu descuento</h3>
            <p className="text-[#8892a4] mb-6">Obtén una <span className="text-[#f0a500] font-bold">consulta GRATIS</span> + 15% de descuento en tu primer proyecto. Solo por hoy.</p>
            <button
              onClick={() => {
                window.open("https://wa.me/50687518055?text=Hola,%20vi%20la%20oferta%20especial%20en%20su%20sitio.%20Quiero%20mi%20consulta%20gratis%20y%20el%2015%25%20de%20descuento.", "_blank");
                setShowExitPopup(false);
              }}
              className="bg-[#f0a500] text-[#0d1b2a] font-bold px-8 py-4 hover:bg-[#d49100] transition-colors text-lg"
              data-testid="exit-popup-cta"
            >
              ¡Quiero mi descuento!
            </button>
            <p className="text-[#8892a4] text-xs mt-4 cursor-pointer hover:text-[#e2e8f0]" onClick={() => setShowExitPopup(false)}>No, gracias</p>
          </div>
        </div>
      )}
    </div>
  );
}
