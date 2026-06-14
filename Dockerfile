FROM node:18-alpine

WORKDIR /app

# Install server dependencies
COPY package.json ./
RUN npm install --production

# Install client dependencies and build
COPY client/ ./client/
RUN cd client && npm install && npx vite build

# Copy server code
COPY server/ ./server/

# Expose port
EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "server/index.js"]
