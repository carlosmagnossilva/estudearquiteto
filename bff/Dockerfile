FROM node:18-slim AS builder
WORKDIR /app
COPY package*.json ./
COPY bff/package*.json ./bff/
COPY shared-types/package*.json ./shared-types/
RUN npm install
COPY tsconfig.json ./
COPY shared-types ./shared-types
COPY bff ./bff
RUN npm run build -w shared-types
RUN npm run build -w bff

FROM node:18-slim
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/bff/package*.json ./bff/
COPY --from=builder /app/bff/dist ./bff/dist
COPY --from=builder /app/shared-types/dist ./shared-types/dist
RUN npm install --production
EXPOSE 4000
CMD ["node", "bff/dist/index.js"]
