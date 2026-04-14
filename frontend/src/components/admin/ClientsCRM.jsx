import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, Filter, X } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STATUSES = ["Lead", "Active", "Closed"];
const SERVICES = ["Sitio Web", "WhatsApp Bot", "Facturación Electrónica", "Sistema POS", "Automatizaciones", "Otro"];

const initialForm = {
  name: "",
  business: "",
  service: "",
  status: "Lead",
  phone: "",
  notes: ""
};

export default function ClientsCRM() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [form, setForm] = useState(initialForm);

  const getToken = () => localStorage.getItem("vertice_token");

  useEffect(() => {
    loadClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  const loadClients = async () => {
    setLoading(true);
    try {
      const params = filterStatus ? `?status=${filterStatus}` : "";
      const response = await axios.get(`${API}/clients${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setClients(response.data);
    } catch (error) {
      toast.error("Error cargando clientes");
    }
    setLoading(false);
  };

  const openModal = (client = null) => {
    if (client) {
      setEditingClient(client);
      setForm(client);
    } else {
      setEditingClient(null);
      setForm(initialForm);
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingClient(null);
    setForm(initialForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingClient) {
        await axios.put(`${API}/clients/${editingClient.id}`, form, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        toast.success("Cliente actualizado");
      } else {
        await axios.post(`${API}/clients`, form, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        toast.success("Cliente creado");
      }
      closeModal();
      loadClients();
    } catch (error) {
      toast.error("Error guardando cliente");
    }
  };

  const deleteClient = async (id) => {
    if (!window.confirm("¿Eliminar este cliente?")) return;
    try {
      await axios.delete(`${API}/clients/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      toast.success("Cliente eliminado");
      loadClients();
    } catch (error) {
      toast.error("Error eliminando cliente");
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Lead": return "status-lead";
      case "Active": return "status-active";
      case "Closed": return "status-closed";
      default: return "";
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.business.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#e2e8f0] font-['Syne']">Clientes CRM</h1>
          <p className="text-[#8892a4] text-sm">Gestiona tus clientes y leads</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-[#f0a500] text-[#0d1b2a] px-4 py-2 rounded font-medium hover:bg-[#d49100] transition-colors"
          data-testid="add-client-btn"
        >
          <Plus size={18} /> Nuevo Cliente
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8892a4]" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o negocio..."
            className="w-full bg-[#16213e] border border-white/10 rounded px-4 py-2 pl-10 text-[#e2e8f0] placeholder-[#8892a4]"
            data-testid="search-clients"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-[#8892a4]" />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40 bg-[#16213e] border-white/10 text-[#e2e8f0]" data-testid="filter-status">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent className="bg-[#16213e] border-white/10">
              <SelectItem value="all" className="text-[#e2e8f0]">Todos</SelectItem>
              {STATUSES.map(s => (
                <SelectItem key={s} value={s} className="text-[#e2e8f0]">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#16213e] border border-white/10 rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table" data-testid="clients-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Negocio</th>
                <th>Servicio</th>
                <th>Estado</th>
                <th>Teléfono</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center text-[#8892a4] py-8">Cargando...</td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-[#8892a4] py-8">No hay clientes</td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id}>
                    <td className="text-[#e2e8f0] font-medium">{client.name}</td>
                    <td className="text-[#8892a4]">{client.business}</td>
                    <td className="text-[#8892a4]">{client.service}</td>
                    <td>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusClass(client.status)}`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="text-[#8892a4]">{client.phone}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModal(client)}
                          className="text-[#8892a4] hover:text-[#f0a500] transition-colors"
                          data-testid={`edit-client-${client.id}`}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => deleteClient(client.id)}
                          className="text-[#8892a4] hover:text-red-400 transition-colors"
                          data-testid={`delete-client-${client.id}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-[#16213e] border-white/10 text-[#e2e8f0] max-w-md">
          <DialogHeader>
            <DialogTitle className="font-['Syne']">
              {editingClient ? "Editar Cliente" : "Nuevo Cliente"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="client-form">
            <div>
              <label className="block text-[#8892a4] text-sm mb-1">Nombre</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})}
                className="w-full bg-[#0d1b2a] border border-white/10 rounded px-3 py-2 text-[#e2e8f0]"
                data-testid="client-name-input"
              />
            </div>
            <div>
              <label className="block text-[#8892a4] text-sm mb-1">Negocio</label>
              <input
                type="text"
                required
                value={form.business}
                onChange={(e) => setForm({...form, business: e.target.value})}
                className="w-full bg-[#0d1b2a] border border-white/10 rounded px-3 py-2 text-[#e2e8f0]"
                data-testid="client-business-input"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[#8892a4] text-sm mb-1">Servicio</label>
                <select
                  required
                  value={form.service}
                  onChange={(e) => setForm({...form, service: e.target.value})}
                  className="w-full bg-[#0d1b2a] border border-white/10 rounded px-3 py-2 text-[#e2e8f0]"
                  data-testid="client-service-select"
                >
                  <option value="">Seleccionar</option>
                  {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[#8892a4] text-sm mb-1">Estado</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({...form, status: e.target.value})}
                  className="w-full bg-[#0d1b2a] border border-white/10 rounded px-3 py-2 text-[#e2e8f0]"
                  data-testid="client-status-select"
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[#8892a4] text-sm mb-1">Teléfono</label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({...form, phone: e.target.value})}
                className="w-full bg-[#0d1b2a] border border-white/10 rounded px-3 py-2 text-[#e2e8f0]"
                data-testid="client-phone-input"
              />
            </div>
            <div>
              <label className="block text-[#8892a4] text-sm mb-1">Notas</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({...form, notes: e.target.value})}
                rows={3}
                className="w-full bg-[#0d1b2a] border border-white/10 rounded px-3 py-2 text-[#e2e8f0] resize-none"
                data-testid="client-notes-input"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 border border-white/10 text-[#8892a4] py-2 rounded hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 bg-[#f0a500] text-[#0d1b2a] py-2 rounded font-medium hover:bg-[#d49100] transition-colors"
                data-testid="client-submit-btn"
              >
                {editingClient ? "Guardar" : "Crear"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
