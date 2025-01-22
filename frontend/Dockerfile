# Frontend Dockerfile
FROM node:22.11.0-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy application code
COPY . .

# Set environment variable
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL $REACT_APP_API_URL

# Build the React app
RUN npm run build

# Installiere serve für die Bereitstellung des Builds
RUN npm install -g serve

# Expose the port
EXPOSE 3000

# Serve den Build
CMD ["serve", "-s", "build"]