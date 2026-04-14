import React, { useState, useRef, useEffect } from "react";
import { Send, Trash2, Download, Code, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { ScrollArea } from "../../components/ui/scroll-area";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ChatHub() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const getToken = () => localStorage.getItem("vertice_token");

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadHistory = async () => {
    try {
      const response = await axios.get(`${API}/chat/history`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setMessages(response.data.reverse());
    } catch (error) {
      console.error("Error loading history:", error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post(`${API}/chat`, 
        { message: userMessage },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      
      setMessages(prev => [...prev, response.data]);
    } catch (error) {
      toast.error("Error al enviar mensaje. Intenta de nuevo.");
      console.error("Chat error:", error);
    }
    setLoading(false);
  };

  const clearHistory = async () => {
    if (!window.confirm("¿Estás seguro de borrar el historial?")) return;
    
    try {
      await axios.delete(`${API}/chat/history`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setMessages([]);
      toast.success("Historial borrado");
    } catch (error) {
      toast.error("Error al borrar historial");
    }
  };

  const extractHtmlCode = (text) => {
    // Try to find HTML in code blocks
    const codeBlockMatch = text.match(/```html\n?([\s\S]*?)```/);
    if (codeBlockMatch) return codeBlockMatch[1];
    
    // Try to find standalone HTML
    const htmlMatch = text.match(/<!DOCTYPE[\s\S]*<\/html>/i);
    if (htmlMatch) return htmlMatch[0];
    
    return null;
  };

  const downloadHtml = (html, filename = "pagina-vertice.html") => {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("HTML descargado");
  };

  const downloadProposal = (text, agentName) => {
    // Create a simple text file for now (PDF would require backend)
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `propuesta-vertice-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Propuesta descargada");
  };

  return (
    <div className="h-full flex flex-col p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#e2e8f0] font-['Syne']">Chat Hub</h1>
          <p className="text-[#8892a4] text-sm">Conversa con los agentes IA de Vértice Digital</p>
        </div>
        <button
          onClick={clearHistory}
          className="flex items-center gap-2 text-[#8892a4] hover:text-red-400 transition-colors text-sm"
          data-testid="clear-chat-btn"
        >
          <Trash2 size={16} />
          Limpiar chat
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 bg-[#16213e] border border-white/10 rounded-md overflow-hidden flex flex-col">
        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-[#8892a4]">
              <div className="text-center">
                <p className="text-lg mb-2">¡Hola! Soy el equipo de Vértice Digital.</p>
                <p className="text-sm">Pregunta sobre cotizaciones, sitios web, automatizaciones...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg, index) => (
                <div key={msg.id || index} className="chat-message space-y-3">
                  {/* User message */}
                  <div className="flex justify-end">
                    <div className="bg-[#f0a500]/20 border border-[#f0a500]/30 rounded-lg px-4 py-3 max-w-[80%]">
                      <p className="text-[#e2e8f0]">{msg.message}</p>
                    </div>
                  </div>
                  
                  {/* Agent response */}
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-[#0d1b2a] border border-white/10 rounded-full flex items-center justify-center text-xl">
                        {msg.agent_emoji}
                      </div>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="agent-badge">
                        <span>{msg.agent_emoji}</span>
                        <span className="font-medium text-[#e2e8f0]">{msg.agent_name}</span>
                      </div>
                      
                      <div className="bg-[#0d1b2a] border border-white/10 rounded-lg p-4">
                        {/* Check for HTML content */}
                        {msg.has_html && extractHtmlCode(msg.response) && (
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="flex items-center gap-2 text-[#f0a500] text-sm">
                                <Code size={14} /> Vista previa HTML
                              </span>
                              <button
                                onClick={() => downloadHtml(extractHtmlCode(msg.response))}
                                className="flex items-center gap-1 text-[#f0a500] hover:text-[#d49100] text-sm"
                                data-testid="download-html-btn"
                              >
                                <Download size={14} /> Descargar
                              </button>
                            </div>
                            <div className="html-preview border border-white/10 rounded">
                              <iframe
                                srcDoc={extractHtmlCode(msg.response)}
                                title="HTML Preview"
                                sandbox="allow-scripts"
                                className="w-full h-64 bg-white"
                              />
                            </div>
                          </div>
                        )}
                        
                        {/* Response text */}
                        <div className="text-[#e2e8f0] whitespace-pre-wrap text-sm leading-relaxed">
                          {msg.response}
                        </div>
                        
                        {/* Proposal download */}
                        {msg.has_proposal && (
                          <div className="mt-4 pt-4 border-t border-white/10">
                            <button
                              onClick={() => downloadProposal(msg.response, msg.agent_name)}
                              className="flex items-center gap-2 bg-[#f0a500] text-[#0d1b2a] px-4 py-2 rounded font-medium text-sm hover:bg-[#d49100] transition-colors"
                              data-testid="download-proposal-btn"
                            >
                              <FileText size={16} /> Descargar Propuesta
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <form onSubmit={sendMessage} className="p-4 border-t border-white/10">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu mensaje... (ej: cotización para sitio web, crear landing page)"
              className="flex-1 bg-[#0d1b2a] border border-white/10 rounded px-4 py-3 text-[#e2e8f0] placeholder-[#8892a4]"
              disabled={loading}
              data-testid="chat-input"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-[#f0a500] text-[#0d1b2a] px-6 py-3 rounded font-medium hover:bg-[#d49100] transition-colors disabled:opacity-50 flex items-center gap-2"
              data-testid="chat-send-btn"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
