# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the application
COPY . .

# Create a .env file during build if VITE_CLERK_PUBLISHABLE_KEY is provided
ARG VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_CLERK_PUBLISHABLE_KEY=${VITE_CLERK_PUBLISHABLE_KEY:-VITE_CLERK_PUBLISHABLE_KEY_PLACEHOLDER}

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Install sed for env variable replacement
RUN apk add --no-cache sed bash

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Create config directory
RUN mkdir -p /docker-entrypoint.d

# Create the env-config.js file
RUN echo "window.VITE_CLERK_PUBLISHABLE_KEY='VITE_CLERK_PUBLISHABLE_KEY_PLACEHOLDER';" > /usr/share/nginx/html/env-config.js

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy entrypoint script
COPY entrypoint.sh /docker-entrypoint.d/40-env-config.sh
RUN chmod +x /docker-entrypoint.d/40-env-config.sh

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
