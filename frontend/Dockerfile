# build 階段
FROM node:21.5.0-alpine AS builder

WORKDIR /app
COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# production 階段
FROM node:21.5.0-alpine

WORKDIR /app
COPY --from=builder /app ./

EXPOSE 3000
CMD ["npm", "start"]
