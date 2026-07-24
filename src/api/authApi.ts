import api from './axios';

export interface User {
  id: number;
  email: string;
  nickname: string;
  created_at?: string;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
}

// 서버가 준 한국어 에러 메시지를 그대로 화면에 쓰기 위해 detail을 꺼낸다.
function toMessage(error: unknown, fallback: string): Error {
  const detail = (error as { response?: { data?: { detail?: unknown } } })
    ?.response?.data?.detail;
  return new Error(typeof detail === 'string' ? detail : fallback);
}

export const signup = async (
  email: string,
  password: string,
  nickname: string,
): Promise<string> => {
  try {
    const response = await api.post<TokenResponse>('/api/v1/auth/signup', {
      email,
      password,
      nickname,
    });
    return response.data.access_token;
  } catch (error) {
    throw toMessage(error, '회원가입에 실패했습니다.');
  }
};

export const login = async (email: string, password: string): Promise<string> => {
  try {
    const response = await api.post<TokenResponse>('/api/v1/auth/login', {
      email,
      password,
    });
    return response.data.access_token;
  } catch (error) {
    throw toMessage(error, '로그인에 실패했습니다.');
  }
};

export const fetchMe = async (): Promise<User> => {
  const response = await api.get<User>('/api/v1/auth/me');
  return response.data;
};
