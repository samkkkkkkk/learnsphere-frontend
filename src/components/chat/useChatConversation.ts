import { useCallback, useEffect, useState } from 'react';
import * as chatApi from '../../api/chatApi';
import type { ChatMessage } from '../../api/chatApi';

/**
 * 한 대화 세션의 상태와 전송 로직.
 *
 * sessionId가 정해지면 서버에서 메시지를 불러오고, 이후 전송분을 이어 붙인다.
 * 대화 이력은 서버가 DB에서 읽으므로 클라이언트가 함께 보내지 않는다.
 */
export function useChatConversation(sessionId: number | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 세션이 바뀌면 그 세션의 메시지를 불러온다
  useEffect(() => {
    if (sessionId === null) {
      setMessages([]);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    chatApi
      .fetchMessages(sessionId)
      .then(loaded => {
        if (!cancelled) setMessages(loaded);
      })
      .catch(() => {
        if (!cancelled) setError('대화를 불러오지 못했습니다.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const send = useCallback(
    async (rawInput: string) => {
      const question = rawInput.trim();
      if (!question || isSending || sessionId === null) return;

      setMessages(prev => [...prev, { role: 'user', content: question }]);
      setError(null);
      setIsSending(true);

      try {
        const { answer, sources } = await chatApi.sendMessage(sessionId, question);
        setMessages(prev => [...prev, { role: 'assistant', content: answer, sources }]);
      } catch {
        setError('답변을 가져오지 못했습니다. 잠시 후 다시 시도해주세요.');
      } finally {
        setIsSending(false);
      }
    },
    [sessionId, isSending],
  );

  return { messages, isSending, isLoading, error, send };
}
