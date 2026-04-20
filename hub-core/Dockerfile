FROM node:18-slim AS builder
WORKDIR /app
COPY package*.json ./
COPY hub-core/package*.json ./hub-core/
COPY shared-types/package*.json ./shared-types/
RUN npm install
COPY tsconfig.json ./
COPY shared-types ./shared-types
COPY hub-core ./hub-core
RUN npm run build -w shared-types
RUN npm run build -w hub-core

FROM node:18-slim
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/hub-core/package*.json ./hub-core/
COPY --from=builder /app/hub-core/dist ./hub-core/dist
COPY --from=builder /app/shared-types/dist ./shared-types/dist
RUN npm install --production
EXPOSE 5001
CMD ["node", "hub-core/dist/index.js"]
