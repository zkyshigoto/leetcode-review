# Build Frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
# Fix: Ensure config files are copied if listed in .gitignore but needed for build (usually not the case for standard vite, but good practice)
RUN npm run build

# Final Stage
FROM python:3.11-slim-bookworm

# Install Nginx and Supervisord
RUN apt-get update && apt-get install -y nginx supervisor && rm -rf /var/lib/apt/lists/*

# Setup Backend
WORKDIR /app/backend
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .

# Setup Frontend (Copy built assets)
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Configure Nginx
COPY deploy/leetcode-review.nginx /etc/nginx/sites-available/default
# Remove the server_name directive to allow it to run on any domain/IP in container
RUN sed -i 's/server_name .*/server_name _;/g' /etc/nginx/sites-available/default

# Configure Supervisord to run both Nginx and Uvicorn
COPY deploy/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
