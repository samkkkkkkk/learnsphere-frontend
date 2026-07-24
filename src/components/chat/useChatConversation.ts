import { useState } from 'react';
import { sendMessage } from '../../api/chatApi';
import type { ChatMessage } from '../../api/chatApi';

/**
 * 대화 상태와 전송 로직.
 *
 * 전역 위젯과 레슨 사이드패널이 같은 동작을 쓰도록 훅으로 뽑았다.
 * lessonId를 주면 해당 레슨 본문이 답변 근거에 우선 포함된다.
 */
export function useChatConversation(lessonId?: number) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async (rawInput: string) => {
    const question = rawInput.trim();
    if (!question || isSending) return;

    // 이번 질문을 붙이기 전의 대화가 서버로 보낼 history가 된다
    const history = messages;
    setMessages(prev => [...prev, { role: 'user', content: question }]);
    setError(null);
    setIsSending(true);

    try {
      const { answer, sources } = await sendMessage(question, history, lessonId);
      setMessages(prev => [...prev, { role: 'assistant', content: answer, sources }]);
    } catch {
      setError('답변을 가져오지 못했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSending(false);
    }
  };

  return { messages, isSending, error, send };
}
