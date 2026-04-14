# Vértice Digital - PRD

## Problem Statement
Full-stack web app for Vértice Digital, IT agency in Liberia, Guanacaste, Costa Rica.

## Architecture
- Public landing page (marketing)
- Admin panel (Chat Hub IA, CRM, Projects)

## Tech Stack
- Backend: FastAPI + MongoDB
- Frontend: React + Tailwind + Shadcn UI
- AI: OpenAI GPT-4o (Emergent LLM Key / standard openai SDK)
- Deploy: Railway.app

## What's Implemented (Feb 2026)
- [x] Public landing page with hero, services, why us, portfolio, contact
- [x] WhatsApp floating button (+50687518055)
- [x] Admin login (JWT auth)
- [x] AI Chat Hub with 10 agents (keyword routing + GPT-4o)
- [x] CRM Clients (CRUD + filters)
- [x] Projects Kanban (4 stages, CRUD)
- [x] Railway deployment (3 services: MongoDB, Backend, Frontend)
- [x] GitHub repo: AllanLeal11/virtual-v1

## Deployment URLs
- Frontend: https://frontend-production-8cb5.up.railway.app
- Backend: https://backend-production-0b59.up.railway.app
- GitHub: https://github.com/AllanLeal11/virtual-v1

## Backlog
- P1: PDF generation with branding for proposals
- P1: Custom domain setup
- P2: Chat history compression (keep last 4 messages, summarize older)
- P2: Netlify deploy integration
- P3: WhatsApp notifications on new contacts
