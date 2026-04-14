# Vértice Digital — Plataforma Web Completa

Aplicación full-stack para **Vértice Digital**, agencia de tecnología en Liberia, Guanacaste, Costa Rica.

## Características

### Sitio Público (Landing Page)
- Hero section con diseño premium dark/gold
- Sección de servicios con precios en colones (₡)
- Sección "¿Por qué elegirnos?"
- Portafolio de trabajo
- Formulario de contacto con redirección a WhatsApp
- Botón flotante de WhatsApp con animación

### Panel de Administración (Login requerido)
- **Chat Hub IA** — 10 agentes especializados con OpenAI GPT-4o
  - Carlos (Ventas), Rodrigo (Developer), Sofía (UI/UX), Mariana (PM), Diego (Marketing), Kevin (Soporte), Luis (Automation), Valeria (Admin), Andrea (Analyst), Coordinador
- **CRM de Clientes** — CRUD completo con filtros por estado
- **Proyectos Kanban** — Tablero con etapas: Design → Dev → Review → Delivered

## Tech Stack
- **Frontend:** React 19 + Tailwind CSS + Shadcn UI
- **Backend:** FastAPI (Python)
- **Base de datos:** MongoDB
- **IA:** OpenAI GPT-4o vía Emergent Integrations
- **Deploy:** Railway.app

---

## Despliegue en Railway.app (Recomendado)

### Paso 1: Crear cuenta en Railway
1. Ve a [railway.app](https://railway.app) y crea una cuenta con GitHub
2. Conecta tu repositorio de GitHub

### Paso 2: Crear los servicios

Necesitas **3 servicios** en Railway:

#### A) MongoDB
1. En tu proyecto Railway, haz click en **"+ New"** → **"Database"** → **"MongoDB"**
2. Railway te dará una `MONGO_URL` automáticamente

#### B) Backend (FastAPI)
1. **"+ New"** → **"GitHub Repo"** → selecciona tu repo
2. Configura:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn server:app --host 0.0.0.0 --port $PORT`
3. Variables de entorno (Settings → Variables):
   ```
   MONGO_URL=<la URL de MongoDB de Railway>
   DB_NAME=vertice_digital
   CORS_ORIGINS=*
   EMERGENT_LLM_KEY=<tu key de Emergent>
   ADMIN_USERNAME=allan
   ADMIN_PASSWORD=Vertice2025$
   JWT_SECRET=<genera una clave secreta larga>
   ```

#### C) Frontend (React)
1. **"+ New"** → **"GitHub Repo"** → selecciona tu repo
2. Configura:
   - **Root Directory:** `frontend`
   - **Build Command:** `yarn install && yarn build`
   - **Start Command:** `npx serve -s build -l $PORT`
3. Variables de entorno:
   ```
   REACT_APP_BACKEND_URL=<URL pública de tu servicio Backend>
   ```

### Paso 3: Conectar servicios
- Copia la URL pública del Backend y pégala como `REACT_APP_BACKEND_URL` en el Frontend
- Copia la `MONGO_URL` del servicio MongoDB y pégala en el Backend

---

## Desarrollo Local

### Requisitos
- Python 3.11+
- Node.js 18+
- MongoDB (local o Atlas)
- Yarn

### Setup

```bash
# 1. Clonar repositorio
git clone <tu-repo>
cd vertice-digital

# 2. Backend
cd backend
cp .env.example .env  # Editar con tus variables
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001 --reload

# 3. Frontend (nueva terminal)
cd frontend
cp .env.example .env  # Editar con tus variables
yarn install
yarn start
```

### Variables de Entorno

#### Backend (`backend/.env`)
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=vertice_digital
CORS_ORIGINS=*
EMERGENT_LLM_KEY=sk-emergent-xxxxx
ADMIN_USERNAME=allan
ADMIN_PASSWORD=Vertice2025$
JWT_SECRET=tu_clave_secreta_aqui
```

#### Frontend (`frontend/.env`)
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

---

## Credenciales por defecto
- **Usuario admin:** allan
- **Contraseña:** Vertice2025$

---

## Estructura del Proyecto

```
vertice-digital/
├── backend/
│   ├── server.py              # API FastAPI principal
│   ├── requirements.txt       # Dependencias Python
│   ├── .env.example          # Template de variables
│   └── Dockerfile            # Para deploy con Docker
├── frontend/
│   ├── src/
│   │   ├── App.js            # Router principal
│   │   ├── index.css         # Estilos globales + tema
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx      # Sitio público
│   │   │   ├── AdminLogin.jsx       # Login admin
│   │   │   └── AdminDashboard.jsx   # Dashboard admin
│   │   └── components/
│   │       └── admin/
│   │           ├── ChatHub.jsx      # Chat IA con agentes
│   │           ├── ClientsCRM.jsx   # Gestión de clientes
│   │           └── ProjectsPanel.jsx # Proyectos kanban
│   ├── package.json
│   ├── .env.example
│   └── tailwind.config.js
├── railway.json               # Config Railway
├── Dockerfile                 # Deploy Docker
└── README.md
```

---

## Contacto
**Vértice Digital** — Liberia, Guanacaste, Costa Rica  
WhatsApp: +506 8751-8055  
CEO: Allan Leal
