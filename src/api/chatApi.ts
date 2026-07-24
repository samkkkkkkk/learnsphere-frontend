import api from './axios';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// 튜터에게 질문을 보내고 답변을 받는다. 이전 대화를 함께 실어 맥락을 잇는다.
export const sendMessage = async (
  message: string,
  history: ChatMessage[] = [],
): Promise<string> => {
  try {
    const response = await api.post('/api/v1/chat', { message, history });
    return response.data.answer;
  } catch (error) {
    console.error('튜터 응답 실패:', error);
    throw new Error('답변을 가져오는데 실패했습니다.');
  }
};
