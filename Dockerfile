# Dockerfile para a aplicação July Finance

# Estágio 1: Build do Frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app
COPY july/package*.json ./
RUN npm ci --only=production
COPY july/ ./
RUN npm run build

# Estágio 2: Build do Backend
FROM node:18-alpine AS backend-build
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ ./

# Estágio 3: Imagem Final
FROM node:18-alpine
WORKDIR /app

# Instalar dependências de produção
COPY --from=backend-build /app/package*.json ./
RUN npm ci --only=production

# Copiar código do backend
COPY --from=backend-build /app/ ./

# Copiar build do frontend
COPY --from=frontend-build /app/dist ./public

# Expor porta
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

# Comando para iniciar
CMD ["npm", "start"] 