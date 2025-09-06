# Stage 1: Build
FROM node:18-bullseye AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app and build
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:18-bullseye AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy package.json and install only production dependencies
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production

# Copy built app from builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js

# Expose port and run
EXPOSE 3000
CMD ["npm", "start"]
