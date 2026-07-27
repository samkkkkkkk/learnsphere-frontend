import { useCallback, useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import * as chatApi from '../../api/chatApi';
import type { ChatMessage } from '../../api/chatApi';

/** 상태 코드별 사용자 안내 문구 */
function toErrorMessage(err: unknown): string {
  if (isAxiosError(err)) {
    const status = err.response?.status;
    if (status === 401) return '로그인이 만료되었습니다. 다시 로그인해주세요.';
    if (status === 429) return '요청이 잠시 몰렸어요. 잠시 후 다시 시도해주세요.';
    if (status && status >= 500) return '서버에 문제가 생겼어요. 잠시 후 다시 시도해주세요.';
    if (!err.response) return '네트워크 연결을 확인해주세요.';
  }
  return '답변을 가져오지 못했습니다. 다시 시도해주세요.';
}

/**
 * 한 대화 세션의 상태와 전송 로직.
 *
 * sessionId가 정해지면 서버에서 메시지를 불러오고, 이후 전송분을 이어 붙인다.
 * 대화 이력은 서버가 DB에서 읽으므로 클라이언트가 함께 보내지 않는다.
 * 전송 실패 시 마지막 질문을 기억해 retry()로 재전송할 수 있다.
 */
export function useChatConversation(sessionId: number | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [failedQuestion, setFailedQuestion] = useState<string | null>(null);

  // 세션이 바뀌면 그 세션의 메시지를 불러온다
  useEffect(() => {
    if (sessionId === null) {
      setMessages([]);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setFailedQuestion(null);

    chatApi
      .fetchMessages(sessionId)
      .then(loaded => {
        if (!cancelled) setMessages(loaded);
      })
      .catch(() => {
        if (!cancelled) setError('지난 대화를 불러오지 못했습니다. 대화는 계속할 수 있어요.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const request = useCallback(
    async (question: string, appendUser: boolean) => {
      if (!question || isSending || sessionId === null) return;

      if (appendUser) {
        setMessages(prev => [...prev, { role: 'user', content: question }]);
      }
      setError(null);
      setFailedQuestion(null);
      setIsSending(true);

      try {
        const { answer, sources } = await chatApi.sendMessage(sessionId, question);
        setMessages(prev => [...prev, { role: 'assistant', content: answer, sources }]);
      } catch (err) {
        setError(toErrorMessage(err));
        setFailedQuestion(question);
      } finally {
        setIsSending(false);
      }
    },
    [sessionId, isSending],
  );

  const send = useCallback((rawInput: string) => request(rawInput.trim(), true), [request]);

  // 실패한 질문 재전송 — 사용자 메시지는 이미 목록에 있으므로 다시 붙이지 않는다
  const retry = useCallback(() => {
    if (failedQuestion) void request(failedQuestion, false);
  }, [failedQuestion, request]);

  return {
    messages,
    isSending,
    isLoading,
    error,
    send,
    retry,
    canRetry: failedQuestion !== null,
  };
}
