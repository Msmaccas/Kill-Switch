FROM node:20-alpine as build

WORKDIR /app

# Install dependencies based on lock file
COPY package.json package-lock.json ./
# Install all dependencies including devDeps. These are required for the build step.
RUN npm ci

# Copy source
COPY . .

# Build the TypeScript source into dist directories
RUN npm run build

# Production image
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
# Copy only runtime assets from the build stage to reduce image size
COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/data ./data
COPY --from=build /app/fixtures ./fixtures
COPY --from=build /app/packages ./packages
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/.env.example ./

EXPOSE 3099

# Start the API server on the configured port
CMD [ "sh", "-c", "PORT=${PORT:-3099} npm start" ]