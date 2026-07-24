// src/api/axios.ts
import axios from 'axios';

// baseURL 미설정 시 상대 경로 → Vite dev 프록시(/api → FastAPI)를 경유한다.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
});

// 관리자 키는 번들에 포함되지 않도록 sessionStorage에만 보관한다.
const ADMIN_KEY_STORAGE = 'learnsphere-admin-api-key';

export function setAdminApiKey(key: string) {
  if (key) {
    sessionStorage.setItem(ADMIN_KEY_STORAGE, key);
  } else {
    sessionStorage.removeItem(ADMIN_KEY_STORAGE);
  }
}

export function getAdminApiKey(): string {
  return sessionStorage.getItem(ADMIN_KEY_STORAGE) ?? '';
}

// 관리자 엔드포인트 호출에만 X-Admin-API-Key 헤더를 자동 첨부
api.interceptors.request.use(config => {
  const key = getAdminApiKey();
  if (key && config.url?.includes('/admin/')) {
    config.headers['X-Admin-API-Key'] = key;
  }
  return config;
});

export default api;
