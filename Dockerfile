# ── Stage 1 — Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Installer les dépendances
COPY package.json package-lock.json* ./
RUN npm ci --silent

# Copier le code source
COPY . .

# Build de production
ARG VITE_API_BASE_URL=http://localhost:8000/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# ── Stage 2 — Production (Nginx) ──────────────────────────────────────────────
FROM nginx:alpine AS production

# Copier le build
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuration Nginx pour React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]