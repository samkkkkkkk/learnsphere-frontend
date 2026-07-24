import api from './axios';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  // 답변의 근거가 된 문서 제목 (assistant 메시지에만)
  sources?: string[] | null;
}

export interface ChatSession {
  id: number;
  title: string | null;
  lesson_id: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface ChatAnswer {
  answer: string;
  sources: string[];
}

// --- 세션 ---

export const createSession = async (lessonId?: number): Promise<ChatSession> => {
  const response = await api.post<ChatSession>('/api/v1/chat/sessions', {
    lesson_id: lessonId ?? null,
  });
  return response.data;
};

export const fetchSessions = async (): Promise<ChatSession[]> => {
  const response = await api.get<ChatSession[]>('/api/v1/chat/sessions');
  return response.data;
};

export const deleteSession = async (sessionId: number): Promise<void> => {
  await api.delete(`/api/v1/chat/sessions/${sessionId}`);
};

export const fetchMessages = async (sessionId: number): Promise<ChatMessage[]> => {
  const response = await api.get<ChatMessage[]>(
    `/api/v1/chat/sessions/${sessionId}/messages`,
  );
  return response.data;
};

// --- 메시지 전송 ---

export const sendMessage = async (
  sessionId: number,
  message: string,
): Promise<ChatAnswer> => {
  try {
    const response = await api.post<ChatAnswer>(
      `/api/v1/chat/sessions/${sessionId}/messages`,
      { message },
    );
    return {
      answer: response.data.answer,
      sources: response.data.sources ?? [],
    };
  } catch (error) {
    console.error('튜터 응답 실패:', error);
    throw new Error('답변을 가져오는데 실패했습니다.');
  }
};
