FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the application
COPY . .

# Build TypeScript
RUN npm run build

# Expose port 3000 (or whatever port your server uses)
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
