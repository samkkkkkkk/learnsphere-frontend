FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# 5173 포트 노출
EXPOSE 5173

# command는 docker-compose.yml에서 오버라이드하여 사용
CMD ["npm", "run", "dev"]