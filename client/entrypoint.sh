#!/bin/sh

# Replace environment variables in the built JS files
find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|VITE_CLERK_PUBLISHABLE_KEY_PLACEHOLDER|$VITE_CLERK_PUBLISHABLE_KEY|g" {} +

# Start nginx
nginx -g "daemon off;"
