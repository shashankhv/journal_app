# Stage 1: Builder
# This stage builds the Next.js application
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the Next.js application
RUN npm run build

# Stage 2: Runner
# This stage creates the final, lightweight production image
FROM node:20-alpine AS runner
WORKDIR /app

# Create a non-root user for security
RUN addgroup --system --gid 1001 nextjs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone output from the builder stage
COPY --from=builder /app/.next/standalone ./
# Copy the static assets
COPY --from=builder /app/.next/static ./.next/static
# Copy the public assets
COPY --from=builder /app/public ./public

# Set the correct user
USER nextjs

# Expose the port the app runs on
EXPOSE 3000

# Set the environment variable for the port
ENV PORT 3000

# Start the server
CMD ["node", "server.js"]
