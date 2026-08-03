# ==========================================
# ---- Stage 1: Build (Frontend) ----
# ==========================================
# Use Node 20 on Alpine Linux for a lightweight, minimal image footprint.
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests first to leverage Docker's layer caching.
# This prevents re-running 'npm ci' unless the package files change.
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the application source code.
COPY . .

# Vite bundles environment variables at compile-time, not runtime.
# We use ARG to pass the value during the 'docker build' process 
# and map it to ENV so Vite can inject it into the static JavaScript files.
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Execute the build script to generate static production assets (dist/).
RUN npm run build


# ==========================================
# ---- Stage 2: Production (Serve) ----
# ==========================================
# Switch to a lightweight Nginx image to serve static files efficiently.
FROM nginx:alpine AS production

# Remove the default Nginx configuration file to ensure it doesn't conflict 
# with our custom requirements (e.g., SPA routing/History mode).
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy only the compiled artifacts from the builder stage.
# This keeps the production image extremely small by excluding source code,
# Node modules, and build dependencies.
COPY --from=builder /app/dist /usr/share/nginx/html

# Document the port the container will listen on.
EXPOSE 80

# Configure a Healthcheck to verify the web server is responding.
# This is used by orchestrators (like Kubernetes or Docker Compose) to monitor service health.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Start Nginx in the foreground so the container process doesn't exit immediately.
CMD ["nginx", "-g", "daemon off;"]