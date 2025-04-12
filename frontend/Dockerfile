# frontend/Dockerfile

FROM node:21.5.0-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:21.5.0-alpine

WORKDIR /app
COPY --from=builder /app .

EXPOSE 3000
CMD ["npm", "start"]
