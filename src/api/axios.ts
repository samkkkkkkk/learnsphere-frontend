// src/api/axios.ts
import axios from 'axios';

// baseURL 미설정 시 상대 경로 → Vite dev 프록시(/api → FastAPI)를 경유한다.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
});

// 관리자 키는 번들에 포함되지 않도록 sessionStorage에만 보관한다.
const ADMIN_KEY_STORAGE = 'learnsphere-admin-api-key';

// 학습자 토큰은 탭을 닫아도 유지되도록 localStorage에 둔다.
const TOKEN_STORAGE = 'learnsphere-token';

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

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE, token);
  } else {
    localStorage.removeItem(TOKEN_STORAGE);
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE);
}

// 토큰이 만료/무효로 판명되면 AuthContext가 로그아웃 상태로 되돌리도록 알린다.
let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

// 관리자 엔드포인트에는 X-Admin-API-Key, 그 외에는 학습자 Bearer 토큰을 첨부
api.interceptors.request.use(config => {
  if (config.url?.includes('/admin/')) {
    const key = getAdminApiKey();
    if (key) {
      config.headers['X-Admin-API-Key'] = key;
    }
    return config;
  }

  const token = getAuthToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// 학습자 토큰이 거부되면 저장된 토큰을 버린다 (관리자 키 흐름은 건드리지 않음)
api.interceptors.response.use(
  response => response,
  error => {
    const isAdminCall = error.config?.url?.includes('/admin/');
    if (error.response?.status === 401 && !isAdminCall && getAuthToken()) {
      setAuthToken(null);
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);

export default api;
