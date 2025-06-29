# # ----------------- STAGE 1: Build -----------------
# # Node.js 18 버전을 기반으로 빌드 환경을 구성합니다.
# FROM node:22-alpine AS builder

# # 작업 디렉토리를 /app 으로 설정합니다.
# WORKDIR /app

# # package.json 과 package-lock.json 파일을 먼저 복사합니다.
# # (이 파일들이 변경되지 않으면, 다음 단계인 npm install은 캐시를 사용해 빠르게 넘어갑니다.)
# COPY package*.json ./

# # 의존성 라이브러리들을 설치합니다.
# RUN npm install

# # 현재 폴더의 모든 소스 코드를 /app 으로 복사합니다.
# COPY . .

# # React 앱을 정적 파일로 빌드합니다.
# RUN npm run build


# # ----------------- STAGE 2: Serve -----------------
# # 가볍고 안정적인 Nginx 서버를 기반으로 최종 이미지를 만듭니다.
# FROM nginx:stable-alpine

# # 위 'builder' 단계의 빌드 결과물(/app/dist)을
# # Nginx의 기본 웹사이트 폴더(/usr/share/nginx/html)로 복사합니다.
# COPY --from=builder /app/dist /usr/share/nginx/html

# # (선택사항) Nginx의 기본 설정을 우리가 만든 설정으로 교체할 수 있습니다.
# # COPY nginx.conf /etc/nginx/conf.d/default.conf

# # 80번 포트를 외부에 노출합니다.
# EXPOSE 80

# # 컨테이너가 시작될 때 Nginx를 실행하는 명령입니다.
# CMD ["nginx", "-g", "daemon off;"]

# 개발용 Dockerfile (예: frontend/dev.Dockerfile)
FROM node:20-alpine AS builder

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 3000

CMD ["npm", "run", "dev"]
