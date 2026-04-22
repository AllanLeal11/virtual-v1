# --- Stage 1: Build Frontend ---
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/package.json frontend/yarn.lock* ./
RUN yarn install --frozen-lockfile || yarn install

COPY frontend/ ./

# Build arg for backend URL (set in Railway env vars)
ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL

RUN yarn build

# --- Stage 2: Backend + Serve Frontend ---
FROM python:3.11-slim

WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend
COPY backend/ ./backend/

# Copy built frontend
COPY --from=frontend-build /app/frontend/build ./frontend/build

# Install a simple static file server for fallback
RUN pip install --no-cache-dir aiofiles

# Create startup script
RUN cat > /app/start.sh << 'EOF'
#!/bin/bash
cd /app/backend
uvicorn server:app --host 0.0.0.0 --port ${PORT:-8001}
EOF
RUN chmod +x /app/start.sh

EXPOSE ${PORT:-8001}

CMD ["/app/start.sh"]
