FROM node:22-slim

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Expose Vite's default port
EXPOSE 5173

# Start the development server and expose on all network interfaces
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
