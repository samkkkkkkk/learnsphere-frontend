import api, { getAuthToken, notifyUnauthorized } from './axios';

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

// --- 메시지 전송 (비스트리밍, 폴백용) ---

export const sendMessage = async (
  sessionId: number,
  message: string,
): Promise<ChatAnswer> => {
  // 오류는 원본(axios) 그대로 던져 호출부가 상태 코드별로 안내를 분기할 수 있게 한다
  const response = await api.post<ChatAnswer>(
    `/api/v1/chat/sessions/${sessionId}/messages`,
    { message },
  );
  return {
    answer: response.data.answer,
    sources: response.data.sources ?? [],
  };
};

// --- 메시지 전송 (스트리밍) ---

/** 서버가 응답은 했지만 정상 상태가 아닐 때. status로 안내 문구를 고른다. */
export class StreamHttpError extends Error {
  status: number;

  constructor(status: number) {
    super(`stream failed with status ${status}`);
    this.name = 'StreamHttpError';
    this.status = status;
  }
}

/** 스트림이 시작된 뒤 서버가 error 이벤트를 보낸 경우. 부분 답변이 함께 온다. */
export class StreamAbortedError extends Error {
  detail: string;
  partial: string;

  constructor(detail: string, partial: string) {
    super(detail);
    this.name = 'StreamAbortedError';
    this.detail = detail;
    this.partial = partial;
  }
}

interface StreamOptions {
  onToken: (token: string) => void;
  signal?: AbortSignal;
}

/**
 * SSE로 답변을 받아 토큰마다 onToken을 부르고, 끝나면 전체 답변과 출처를 돌려준다.
 *
 * axios가 아닌 fetch를 쓰는 이유: `EventSource`는 Authorization 헤더를 붙일 수 없고,
 * axios(XHR)는 본문을 조각으로 읽을 수 없다.
 *
 * 던지는 오류:
 *  - `StreamHttpError` — 응답 상태가 200이 아님 (요청은 서버에 닿았다)
 *  - `StreamAbortedError` — 스트림 도중 서버가 생성 실패를 알림
 *  - `DOMException(AbortError)` — 호출부가 signal로 취소
 *  - 그 외(TypeError 등) — 서버에 닿지 못함. 이때만 비스트리밍 폴백이 안전하다.
 */
export const streamMessage = async (
  sessionId: number,
  message: string,
  { onToken, signal }: StreamOptions,
): Promise<ChatAnswer> => {
  const token = getAuthToken();
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL ?? ''}/api/v1/chat/sessions/${sessionId}/stream`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ message }),
      signal,
    },
  );

  if (!response.ok || !response.body) {
    if (response.status === 401) notifyUnauthorized();
    throw new StreamHttpError(response.status);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let answer = '';
  let sources: string[] = [];

  const handleLine = (line: string) => {
    if (!line.startsWith('data: ')) return;
    const event = JSON.parse(line.slice('data: '.length));

    if (event.type === 'token') {
      answer += event.content;
      onToken(event.content);
    } else if (event.type === 'done') {
      sources = event.sources ?? [];
    } else if (event.type === 'error') {
      throw new StreamAbortedError(event.detail, answer);
    }
  };

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // 마지막 조각은 잘린 줄일 수 있으므로 버퍼에 남겨 둔다
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) handleLine(line.trimEnd());
    }
    if (buffer.trim()) handleLine(buffer.trimEnd());
  } finally {
    // 중도 취소 시 서버 쪽 연결을 즉시 정리한다
    void reader.cancel().catch(() => {});
  }

  return { answer, sources };
};
