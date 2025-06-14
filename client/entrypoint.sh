#!/bin/sh

# Replace environment variables in the JS files
find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|VITE_CLERK_PUBLISHABLE_KEY_PLACEHOLDER|${VITE_CLERK_PUBLISHABLE_KEY}|g" {} +

# Generate env-config.js with runtime values
echo "window.VITE_CLERK_PUBLISHABLE_KEY='${VITE_CLERK_PUBLISHABLE_KEY}';" > /usr/share/nginx/html/env-config.js

# Execute the original entrypoint
exec "$@"
