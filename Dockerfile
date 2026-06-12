# --- Stage 1: Build ---
FROM node:18-alpine AS builder

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copiar el código fuente y compilar
COPY . .
RUN npm run build

# --- Stage 2: Serve ---
FROM nginx:alpine

# Limpiar el contenido default de Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar el build de React al directorio de Nginx
COPY --from=builder /app/build /usr/share/nginx/html

# Sobrescribir configuración default de nginx para soportar SPA (React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
