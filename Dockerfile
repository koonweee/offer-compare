# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html
COPY docker-entrypoint.d/40-set-env-js.sh /docker-entrypoint.d/40-set-env-js.sh
RUN chmod +x /docker-entrypoint.d/40-set-env-js.sh

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
