FROM node:18-slim AS builder
WORKDIR /app
COPY package*.json ./
COPY hub-integrator/package*.json ./hub-integrator/
COPY shared-types/package*.json ./shared-types/
RUN npm install
COPY tsconfig.json ./
COPY shared-types ./shared-types
COPY hub-integrator ./hub-integrator
RUN npm run build -w @hub/shared
RUN npm run build -w hub-integrator

FROM node:18-slim
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/hub-integrator/package*.json ./hub-integrator/
COPY --from=builder /app/hub-integrator/dist ./hub-integrator/dist
COPY --from=builder /app/shared-types/dist ./shared-types/dist
RUN npm install --production
CMD ["node", "hub-integrator/dist/index.js"]