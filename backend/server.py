from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import jwt
import bcrypt
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'vertice_secret_2025')
JWT_ALGORITHM = "HS256"
security = HTTPBearer()

# Create the main app
app = FastAPI(title="Vértice Digital API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ============== MODELS ==============

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    token: str
    username: str

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    agent_name: str
    agent_emoji: str
    message: str
    response: str
    has_html: bool = False
    has_proposal: bool = False
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ClientModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    business: str
    service: str
    status: str = "Lead"  # Lead, Active, Closed
    phone: str
    notes: str = ""
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ClientCreate(BaseModel):
    name: str
    business: str
    service: str
    status: str = "Lead"
    phone: str
    notes: str = ""

class ClientUpdate(BaseModel):
    name: Optional[str] = None
    business: Optional[str] = None
    service: Optional[str] = None
    status: Optional[str] = None
    phone: Optional[str] = None
    notes: Optional[str] = None

class ProjectModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    client_name: str
    service: str
    stage: str = "Design"  # Design, Dev, Review, Delivered
    deadline: str
    notes: str = ""
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ProjectCreate(BaseModel):
    name: str
    client_name: str
    service: str
    stage: str = "Design"
    deadline: str
    notes: str = ""

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    client_name: Optional[str] = None
    service: Optional[str] = None
    stage: Optional[str] = None
    deadline: Optional[str] = None
    notes: Optional[str] = None

class ContactRequest(BaseModel):
    name: str
    email: str
    phone: str
    service: str
    message: str

# ============== AGENTS ==============

AGENTS = {
    "carlos": {
        "name": "Carlos",
        "emoji": "💼",
        "role": "Sales",
        "keywords": ["cotización", "cotizacion", "precio", "presupuesto", "propuesta", "costo", "cuanto", "cuánto", "tarifa", "quote", "proposal", "paquete"],
        "system_prompt": """Eres Carlos, el agente de ventas de Vértice Digital. Tu trabajo es generar propuestas comerciales completas.

SIEMPRE incluye en tus propuestas:
- Descripción detallada del servicio
- Precio en colones (₡)
- Timeline de entrega
- Garantías incluidas
- Información de pago SINPE Móvil: +506 8751-8055 a nombre de Allan Leal

Servicios y precios base:
- Sitios Web: ₡150,000 - ₡600,000
- WhatsApp Bot: ₡200,000
- Facturación Electrónica: ₡150,000
- Sistema POS: ₡400,000
- Automatizaciones: Cotización según requerimientos

ENTREGA la propuesta inmediatamente, nunca pidas reuniones previas."""
    },
    "rodrigo": {
        "name": "Rodrigo",
        "emoji": "💻",
        "role": "Developer",
        "keywords": ["código", "codigo", "html", "css", "javascript", "web", "página", "pagina", "sitio", "website", "programar", "desarrollar", "landing"],
        "system_prompt": """Eres Rodrigo, el desarrollador senior de Vértice Digital. Generas sitios web completos y funcionales.

Cuando te pidan un sitio web, ENTREGA código HTML completo con:
- Estructura HTML5 semántica
- CSS embebido con diseño moderno y responsive
- Hero section atractivo
- Secciones de servicios, about, contacto
- Animaciones CSS suaves
- Imágenes de Unsplash (usa URLs reales)
- Botón flotante de WhatsApp (+506 8751-8055)
- Colores profesionales

SIEMPRE entrega el código completo listo para usar. NUNCA pidas más información."""
    },
    "sofia": {
        "name": "Sofía",
        "emoji": "🎨",
        "role": "UI/UX Designer",
        "keywords": ["diseño", "diseno", "colores", "paleta", "tipografía", "tipografia", "branding", "marca", "logo", "visual", "ui", "ux", "interfaz"],
        "system_prompt": """Eres Sofía, la diseñadora UI/UX de Vértice Digital. Entregas guías de diseño completas.

Cuando te consulten sobre diseño, ENTREGA:
- Paleta de colores con códigos HEX
- Tipografías recomendadas (Google Fonts)
- Guías de espaciado y layout
- Principios de branding
- Ejemplos de aplicación

ENTREGA inmediatamente, sin pedir información adicional."""
    },
    "mariana": {
        "name": "Mariana",
        "emoji": "📋",
        "role": "Project Manager",
        "keywords": ["proyecto", "timeline", "cronograma", "plazo", "plazos", "fases", "etapas", "planificación", "planificacion", "gestión", "gestion", "calendario"],
        "system_prompt": """Eres Mariana, la Project Manager de Vértice Digital. Creas cronogramas detallados.

Cuando te pidan planificación, ENTREGA:
- Timeline en formato tabla markdown
- Fases del proyecto claras
- Hitos importantes
- Fechas estimadas
- Responsabilidades

ENTREGA el cronograma inmediatamente en formato tabla."""
    },
    "diego": {
        "name": "Diego",
        "emoji": "📣",
        "role": "Marketing",
        "keywords": ["marketing", "redes", "social", "publicidad", "facebook", "instagram", "contenido", "campaña", "campana", "promoción", "promocion", "anuncio"],
        "system_prompt": """Eres Diego, el especialista en marketing de Vértice Digital. Creas estrategias de marketing local para Guanacaste.

Cuando te consulten, ENTREGA:
- Copy para redes sociales
- Estrategias de marketing local
- Ideas de contenido
- Calendario de publicaciones
- Hashtags relevantes para Costa Rica/Guanacaste

ENTREGA contenido listo para publicar, enfocado en negocios de Guanacaste."""
    },
    "kevin": {
        "name": "Kevin",
        "emoji": "🔧",
        "role": "Support",
        "keywords": ["problema", "error", "ayuda", "soporte", "no funciona", "falla", "bug", "arreglar", "solucionar", "técnico", "tecnico"],
        "system_prompt": """Eres Kevin, el técnico de soporte de Vértice Digital. Diagnosticas y resuelves problemas técnicos.

Cuando te reporten un problema:
1. Identifica el problema
2. Explica la causa probable
3. Da pasos de solución claros
4. Ofrece prevención futura

RESPONDE con soluciones paso a paso, sin pedir más información innecesaria."""
    },
    "luis": {
        "name": "Luis",
        "emoji": "⚙️",
        "role": "Automation",
        "keywords": ["automatización", "automatizacion", "n8n", "workflow", "api", "integración", "integracion", "whatsapp business", "bot", "flujo", "zapier"],
        "system_prompt": """Eres Luis, el especialista en automatización de Vértice Digital. Diseñas workflows y automatizaciones.

Cuando te pidan automatización, ENTREGA:
- Diagrama del workflow
- Pasos de configuración n8n
- Integraciones necesarias
- Triggers y acciones
- APIs a utilizar

ENTREGA el diseño completo del workflow inmediatamente."""
    },
    "valeria": {
        "name": "Valeria",
        "emoji": "📊",
        "role": "Admin",
        "keywords": ["factura", "contrato", "documento", "legal", "administrativo", "pago", "cobro", "finanzas", "reporte", "informe"],
        "system_prompt": """Eres Valeria, la administradora de Vértice Digital. Creas documentos administrativos.

Cuando te pidan documentos, ENTREGA:
- Contratos en formato profesional
- Facturas con todos los datos
- Reportes financieros en colones (₡)
- Documentos listos para usar

Datos de la empresa:
- Vértice Digital
- Liberia, Guanacaste, Costa Rica
- Tel: +506 8751-8055
- CEO: Allan Leal

ENTREGA documentos completos inmediatamente."""
    },
    "andrea": {
        "name": "Andrea",
        "emoji": "🔍",
        "role": "Analyst",
        "keywords": ["análisis", "analisis", "especificaciones", "spec", "requerimientos", "requisitos", "funcionalidades", "características", "caracteristicas", "alcance"],
        "system_prompt": """Eres Andrea, la analista técnica de Vértice Digital. Creas especificaciones técnicas detalladas.

Cuando te pidan análisis, ENTREGA:
- Hoja de especificaciones técnicas
- Lista de funcionalidades
- Stack tecnológico recomendado
- Horas estimadas de desarrollo
- Dependencias y riesgos

ENTREGA el análisis completo en formato estructurado."""
    },
    "coordinator": {
        "name": "Coordinador",
        "emoji": "🤖",
        "role": "Coordinator",
        "keywords": [],  # Fallback agent
        "system_prompt": """Eres el Coordinador de Vértice Digital, el asistente general del equipo.

Ayudas con consultas generales sobre:
- Información de la empresa
- Servicios disponibles
- Proceso de trabajo
- Cualquier otra consulta

Si la consulta es muy específica, sugiere el agente especializado apropiado.

Servicios de Vértice Digital:
- Sitios Web: ₡150,000 - ₡600,000
- WhatsApp Bot: ₡200,000
- Facturación Electrónica: ₡150,000
- Sistema POS: ₡400,000
- Automatizaciones: Cotización personalizada

Ubicación: Liberia, Guanacaste, Costa Rica
Contacto: +506 8751-8055"""
    }
}

BASE_CONTEXT = """Vértice Digital, empresa de tecnología en Liberia, Guanacaste, Costa Rica. 
Jefe: Allan Leal (CEO). 
Servicios: desarrollo web, WhatsApp Bot, facturación electrónica, sistemas POS, automatizaciones. 
Todos los precios en colones costarricenses (₡). 
IMPORTANTE: NUNCA pidas reuniones ni información adicional previa. ENTREGA tu respuesta inmediatamente con toda la información relevante."""

# ============== AUTH HELPERS ==============

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def detect_agent(message: str) -> dict:
    """Detect which agent should handle the message based on keywords"""
    message_lower = message.lower()
    
    for agent_key, agent_data in AGENTS.items():
        if agent_key == "coordinator":
            continue
        for keyword in agent_data["keywords"]:
            if keyword in message_lower:
                return agent_data
    
    return AGENTS["coordinator"]

# ============== ROUTES ==============

@api_router.get("/")
async def root():
    return {"message": "Vértice Digital API", "version": "1.0.0"}

# Auth routes
@api_router.post("/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    admin_username = os.environ.get('ADMIN_USERNAME', 'allan')
    admin_password = os.environ.get('ADMIN_PASSWORD', 'Vertice2025$')
    
    if request.username != admin_username or request.password != admin_password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = jwt.encode(
        {"sub": request.username, "exp": datetime.now(timezone.utc).timestamp() + 86400},
        JWT_SECRET,
        algorithm=JWT_ALGORITHM
    )
    
    return LoginResponse(token=token, username=request.username)

@api_router.get("/auth/verify")
async def verify_auth(payload: dict = Depends(verify_token)):
    return {"valid": True, "username": payload.get("sub")}

# Chat routes
@api_router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, payload: dict = Depends(verify_token)):
    try:
        agent = detect_agent(request.message)
        
        system_message = f"{BASE_CONTEXT}\n\n{agent['system_prompt']}"
        
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="API key not configured")
        
        chat_instance = LlmChat(
            api_key=api_key,
            session_id=f"vertice-{uuid.uuid4()}",
            system_message=system_message
        ).with_model("openai", "gpt-4o")
        
        user_message = UserMessage(text=request.message)
        response_text = await chat_instance.send_message(user_message)
        
        has_html = "<!DOCTYPE" in response_text or "<html" in response_text or "```html" in response_text
        has_proposal = any(word in response_text.lower() for word in ["propuesta", "cotización", "cotizacion", "presupuesto", "₡"])
        
        chat_response = ChatResponse(
            agent_name=agent["name"],
            agent_emoji=agent["emoji"],
            message=request.message,
            response=response_text,
            has_html=has_html,
            has_proposal=has_proposal
        )
        
        # Save to database
        await db.chat_history.insert_one(chat_response.model_dump())
        
        return chat_response
        
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/chat/history", response_model=List[ChatResponse])
async def get_chat_history(payload: dict = Depends(verify_token)):
    history = await db.chat_history.find({}, {"_id": 0}).sort("timestamp", -1).to_list(50)
    return history

@api_router.delete("/chat/history")
async def clear_chat_history(payload: dict = Depends(verify_token)):
    await db.chat_history.delete_many({})
    return {"message": "Chat history cleared"}

# Client routes
@api_router.get("/clients", response_model=List[ClientModel])
async def get_clients(status: Optional[str] = None, payload: dict = Depends(verify_token)):
    query = {}
    if status:
        query["status"] = status
    clients = await db.clients.find(query, {"_id": 0}).to_list(1000)
    return clients

@api_router.post("/clients", response_model=ClientModel)
async def create_client(client: ClientCreate, payload: dict = Depends(verify_token)):
    client_obj = ClientModel(**client.model_dump())
    await db.clients.insert_one(client_obj.model_dump())
    return client_obj

@api_router.put("/clients/{client_id}", response_model=ClientModel)
async def update_client(client_id: str, client_update: ClientUpdate, payload: dict = Depends(verify_token)):
    update_data = {k: v for k, v in client_update.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await db.clients.find_one_and_update(
        {"id": client_id},
        {"$set": update_data},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Client not found")
    
    del result["_id"]
    return ClientModel(**result)

@api_router.delete("/clients/{client_id}")
async def delete_client(client_id: str, payload: dict = Depends(verify_token)):
    result = await db.clients.delete_one({"id": client_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Client not found")
    return {"message": "Client deleted"}

# Project routes
@api_router.get("/projects", response_model=List[ProjectModel])
async def get_projects(stage: Optional[str] = None, payload: dict = Depends(verify_token)):
    query = {}
    if stage:
        query["stage"] = stage
    projects = await db.projects.find(query, {"_id": 0}).to_list(1000)
    return projects

@api_router.post("/projects", response_model=ProjectModel)
async def create_project(project: ProjectCreate, payload: dict = Depends(verify_token)):
    project_obj = ProjectModel(**project.model_dump())
    await db.projects.insert_one(project_obj.model_dump())
    return project_obj

@api_router.put("/projects/{project_id}", response_model=ProjectModel)
async def update_project(project_id: str, project_update: ProjectUpdate, payload: dict = Depends(verify_token)):
    update_data = {k: v for k, v in project_update.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await db.projects.find_one_and_update(
        {"id": project_id},
        {"$set": update_data},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Project not found")
    
    del result["_id"]
    return ProjectModel(**result)

@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str, payload: dict = Depends(verify_token)):
    result = await db.projects.delete_one({"id": project_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project deleted"}

# Contact form (public)
@api_router.post("/contact")
async def submit_contact(contact: ContactRequest):
    contact_dict = contact.model_dump()
    contact_dict["id"] = str(uuid.uuid4())
    contact_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.contacts.insert_one(contact_dict)
    return {"message": "Mensaje recibido. ¡Te contactaremos pronto!", "whatsapp_redirect": f"https://wa.me/50687518055?text=Hola, soy {contact.name}. {contact.message}"}

# Agents info (public for admin sidebar)
@api_router.get("/agents")
async def get_agents(payload: dict = Depends(verify_token)):
    agents_list = []
    for key, agent in AGENTS.items():
        agents_list.append({
            "key": key,
            "name": agent["name"],
            "emoji": agent["emoji"],
            "role": agent["role"]
        })
    return agents_list

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
