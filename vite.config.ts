import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0', // Docker 컨테이너에서 외부 접근 허용
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000', // 로컬 FastAPI 서버 주소
        changeOrigin: true
        // rewrite 옵션 제거: /api/v1/... 경로가 그대로 전달됨
      },
    },
  },
});
