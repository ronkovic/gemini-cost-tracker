# Use official Node.js runtime as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy source code
COPY dist/ ./dist/
COPY bin/ ./bin/

# Make CLI executable
RUN chmod +x ./bin/gemini-cost-tracker

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S gemini -u 1001

# Change ownership of the app directory
RUN chown -R gemini:nodejs /app

# Switch to non-root user
USER gemini

# Set the CLI as entrypoint
ENTRYPOINT ["/app/bin/gemini-cost-tracker"]