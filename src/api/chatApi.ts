import api from './axios';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  // 답변의 근거가 된 문서 제목 (assistant 메시지에만)
  sources?: string[];
}

export interface ChatAnswer {
  answer: string;
  sources: string[];
}

// 튜터에게 질문을 보내고 답변을 받는다. 이전 대화를 함께 실어 맥락을 잇는다.
export const sendMessage = async (
  message: string,
  history: ChatMessage[] = [],
  lessonId?: number,
): Promise<ChatAnswer> => {
  try {
    // 서버가 필요로 하는 건 role/content뿐이므로 sources는 떼고 보낸다
    const trimmedHistory = history.map(({ role, content }) => ({ role, content }));
    const response = await api.post('/api/v1/chat', {
      message,
      history: trimmedHistory,
      lesson_id: lessonId,
    });
    return {
      answer: response.data.answer,
      sources: response.data.sources ?? [],
    };
  } catch (error) {
    console.error('튜터 응답 실패:', error);
    throw new Error('답변을 가져오는데 실패했습니다.');
  }
};
