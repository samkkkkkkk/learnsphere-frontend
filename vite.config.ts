import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0', // Docker 컨테이너에서 외부 접근 허용
    proxy: {
      '/api': {
        target: 'http://backend:8000', // Docker 네트워크 내부 주소
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // 필요시 경로 수정
      },
    },
  },
});
