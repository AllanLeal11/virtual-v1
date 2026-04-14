import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STAGES = ["Design", "Dev", "Review", "Delivered"];
const SERVICES = ["Sitio Web", "WhatsApp Bot", "Facturación Electrónica", "Sistema POS", "Automatizaciones", "Otro"];

const initialForm = {
  name: "",
  client_name: "",
  service: "",
  stage: "Design",
  deadline: "",
  notes: ""
};

export default function ProjectsPanel() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStage, setFilterStage] = useState("");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [form, setForm] = useState(initialForm);

  const getToken = () => localStorage.getItem("vertice_token");

  useEffect(() => {
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStage]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const params = filterStage ? `?stage=${filterStage}` : "";
      const response = await axios.get(`${API}/projects${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setProjects(response.data);
    } catch (error) {
      toast.error("Error cargando proyectos");
    }
    setLoading(false);
  };

  const openModal = (project = null) => {
    if (project) {
      setEditingProject(project);
      setForm(project);
    } else {
      setEditingProject(null);
      setForm(initialForm);
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProject(null);
    setForm(initialForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProject) {
        await axios.put(`${API}/projects/${editingProject.id}`, form, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        toast.success("Proyecto actualizado");
      } else {
        await axios.post(`${API}/projects`, form, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        toast.success("Proyecto creado");
      }
      closeModal();
      loadProjects();
    } catch (error) {
      toast.error("Error guardando proyecto");
    }
  };

  const deleteProject = async (id) => {
    if (!window.confirm("¿Eliminar este proyecto?")) return;
    try {
      await axios.delete(`${API}/projects/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      toast.success("Proyecto eliminado");
      loadProjects();
    } catch (error) {
      toast.error("Error eliminando proyecto");
    }
  };

  const updateStage = async (project, newStage) => {
    try {
      await axios.put(`${API}/projects/${project.id}`, { stage: newStage }, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      toast.success("Etapa actualizada");
      loadProjects();
    } catch (error) {
      toast.error("Error actualizando etapa");
    }
  };

  const getStageClass = (stage) => {
    switch (stage) {
      case "Design": return "stage-design";
      case "Dev": return "stage-dev";
      case "Review": return "stage-review";
      case "Delivered": return "stage-delivered";
      default: return "";
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.client_name.toLowerCase().includes(search.toLowerCase())
  );

  // Group projects by stage for Kanban view
  const projectsByStage = STAGES.reduce((acc, stage) => {
    acc[stage] = filteredProjects.filter(p => p.stage === stage);
    return acc;
  }, {});

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#e2e8f0] font-['Syne']">Proyectos</h1>
          <p className="text-[#8892a4] text-sm">Gestiona el flujo de trabajo</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-[#f0a500] text-[#0d1b2a] px-4 py-2 rounded font-medium hover:bg-[#d49100] transition-colors"
          data-testid="add-project-btn"
        >
          <Plus size={18} /> Nuevo Proyecto
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
            placeholder="Buscar por nombre o cliente..."
            className="w-full bg-[#16213e] border border-white/10 rounded px-4 py-2 pl-10 text-[#e2e8f0] placeholder-[#8892a4]"
            data-testid="search-projects"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-[#8892a4]" />
          <Select value={filterStage} onValueChange={setFilterStage}>
            <SelectTrigger className="w-40 bg-[#16213e] border-white/10 text-[#e2e8f0]" data-testid="filter-stage">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent className="bg-[#16213e] border-white/10">
              <SelectItem value="all" className="text-[#e2e8f0]">Todas</SelectItem>
              {STAGES.map(s => (
                <SelectItem key={s} value={s} className="text-[#e2e8f0]">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAGES.map((stage) => (
          <div key={stage} className="bg-[#16213e]/50 border border-white/10 rounded-md">
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded text-sm font-medium ${getStageClass(stage)}`}>
                  {stage}
                </span>
                <span className="text-[#8892a4] text-sm">{projectsByStage[stage].length}</span>
              </div>
            </div>
            <div className="p-2 space-y-2 min-h-[200px]">
              {loading ? (
                <p className="text-[#8892a4] text-sm text-center py-4">Cargando...</p>
              ) : projectsByStage[stage].length === 0 ? (
                <p className="text-[#8892a4] text-sm text-center py-4">Sin proyectos</p>
              ) : (
                projectsByStage[stage].map((project) => (
                  <div
                    key={project.id}
                    className="bg-[#0d1b2a] border border-white/10 rounded p-3 hover:border-[#f0a500]/30 transition-colors"
                    data-testid={`project-card-${project.id}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-[#e2e8f0] font-medium text-sm">{project.name}</h3>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openModal(project)}
                          className="text-[#8892a4] hover:text-[#f0a500] transition-colors p-1"
                          data-testid={`edit-project-${project.id}`}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => deleteProject(project.id)}
                          className="text-[#8892a4] hover:text-red-400 transition-colors p-1"
                          data-testid={`delete-project-${project.id}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <p className="text-[#8892a4] text-xs mb-2">{project.client_name}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[#8892a4] text-xs">{project.service}</span>
                      {project.deadline && (
                        <span className="text-[#8892a4] text-xs">{project.deadline}</span>
                      )}
                    </div>
                    {/* Quick stage change */}
                    <div className="mt-2 pt-2 border-t border-white/5">
                      <select
                        value={project.stage}
                        onChange={(e) => updateStage(project, e.target.value)}
                        className="w-full bg-[#16213e] border border-white/10 rounded px-2 py-1 text-xs text-[#e2e8f0]"
                        data-testid={`stage-select-${project.id}`}
                      >
                        {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-[#16213e] border-white/10 text-[#e2e8f0] max-w-md">
          <DialogHeader>
            <DialogTitle className="font-['Syne']">
              {editingProject ? "Editar Proyecto" : "Nuevo Proyecto"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="project-form">
            <div>
              <label className="block text-[#8892a4] text-sm mb-1">Nombre del Proyecto</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})}
                className="w-full bg-[#0d1b2a] border border-white/10 rounded px-3 py-2 text-[#e2e8f0]"
                data-testid="project-name-input"
              />
            </div>
            <div>
              <label className="block text-[#8892a4] text-sm mb-1">Cliente</label>
              <input
                type="text"
                required
                value={form.client_name}
                onChange={(e) => setForm({...form, client_name: e.target.value})}
                className="w-full bg-[#0d1b2a] border border-white/10 rounded px-3 py-2 text-[#e2e8f0]"
                data-testid="project-client-input"
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
                  data-testid="project-service-select"
                >
                  <option value="">Seleccionar</option>
                  {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[#8892a4] text-sm mb-1">Etapa</label>
                <select
                  value={form.stage}
                  onChange={(e) => setForm({...form, stage: e.target.value})}
                  className="w-full bg-[#0d1b2a] border border-white/10 rounded px-3 py-2 text-[#e2e8f0]"
                  data-testid="project-stage-select"
                >
                  {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[#8892a4] text-sm mb-1">Fecha Límite</label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({...form, deadline: e.target.value})}
                className="w-full bg-[#0d1b2a] border border-white/10 rounded px-3 py-2 text-[#e2e8f0]"
                data-testid="project-deadline-input"
              />
            </div>
            <div>
              <label className="block text-[#8892a4] text-sm mb-1">Notas</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({...form, notes: e.target.value})}
                rows={3}
                className="w-full bg-[#0d1b2a] border border-white/10 rounded px-3 py-2 text-[#e2e8f0] resize-none"
                data-testid="project-notes-input"
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
                data-testid="project-submit-btn"
              >
                {editingProject ? "Guardar" : "Crear"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
