import { useCallback, useEffect, useRef, useState } from 'react';
import { isAxiosError } from 'axios';
import * as chatApi from '../../api/chatApi';
import type { ChatMessage } from '../../api/chatApi';

function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === 'AbortError';
}

/** 상태 코드별 사용자 안내 문구 */
function messageForStatus(status: number | undefined): string | null {
  if (status === 401) return '로그인이 만료되었습니다. 다시 로그인해주세요.';
  if (status === 403) return '접근할 수 없는 대화입니다.';
  if (status === 429) return '요청이 잠시 몰렸어요. 잠시 후 다시 시도해주세요.';
  if (status && status >= 500) return '서버에 문제가 생겼어요. 잠시 후 다시 시도해주세요.';
  return null;
}

function toErrorMessage(err: unknown): string {
  if (err instanceof chatApi.StreamAbortedError) return err.detail;
  if (err instanceof chatApi.StreamHttpError) {
    return messageForStatus(err.status) ?? '답변을 가져오지 못했습니다. 다시 시도해주세요.';
  }
  if (isAxiosError(err)) {
    const byStatus = messageForStatus(err.response?.status);
    if (byStatus) return byStatus;
    if (!err.response) return '네트워크 연결을 확인해주세요.';
  }
  return '답변을 가져오지 못했습니다. 다시 시도해주세요.';
}

/**
 * 한 대화 세션의 상태와 전송 로직.
 *
 * sessionId가 정해지면 서버에서 메시지를 불러오고, 이후 전송분을 이어 붙인다.
 * 대화 이력은 서버가 DB에서 읽으므로 클라이언트가 함께 보내지 않는다.
 *
 * 전송은 SSE 스트리밍이 기본이다. 서버에 닿지도 못한 경우(프록시가 SSE를 끊는 등)에만
 * 비스트리밍 엔드포인트로 한 번 더 시도한다 — 스트림이 200으로 시작한 뒤 실패한 경우에는
 * 질문이 이미 서버에 저장돼 있어, 폴백하면 같은 질문이 두 번 쌓이기 때문이다.
 *
 * 전송 실패 시 마지막 질문을 기억해 retry()로 재전송할 수 있다.
 */
export function useChatConversation(sessionId: number | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [failedQuestion, setFailedQuestion] = useState<string | null>(null);
  // 도착하는 중인 답변. null이면 스트리밍 중이 아니다.
  const [streamingAnswer, setStreamingAnswer] = useState<string | null>(null);
  // 값이 바뀌면 서버에서 메시지를 다시 읽는다 (reload()가 올린다)
  const [reloadKey, setReloadKey] = useState(0);

  const abortRef = useRef<AbortController | null>(null);
  // 지금 화면에 떠 있는 세션. 배경으로 밀려난 스트림이 남의 대화에 끼어들지 않도록 대조한다.
  const shownSessionRef = useRef(sessionId);

  useEffect(() => {
    shownSessionRef.current = sessionId;
  }, [sessionId]);

  /** 서버의 대화 내용을 다시 읽어 화면을 맞춘다.
   *
   * 창을 닫아도 언마운트되지 않는 위젯이 다시 열릴 때, 그리고 배경으로 밀려났던
   * 스트림이 끝났을 때 필요하다. 어느 쪽이든 답변이 서버에만 있는 상태이기 때문이다.
   */
  const reload = useCallback(() => setReloadKey(key => key + 1), []);

  // 화면을 완전히 떠날 때만 스트림을 끊는다.
  // 세션을 바꾸는 것만으로는 끊지 않는다 — 답변은 서버에서 끝까지 생성돼 저장되고,
  // 그 세션으로 돌아오면 완성된 답변을 보게 된다. (중간에 끊으면 답변이 잘린 채 남는다.)
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      abortRef.current = null;
    };
  }, []);

  // 세션이 바뀌면 그 세션의 메시지를 불러온다
  useEffect(() => {
    setStreamingAnswer(null);
    setIsSending(false);

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
  }, [sessionId, reloadKey]);

  const request = useCallback(
    async (question: string, appendUser: boolean) => {
      if (!question || isSending || sessionId === null) return;

      if (appendUser) {
        setMessages(prev => [...prev, { role: 'user', content: question }]);
      }
      setError(null);
      setFailedQuestion(null);
      setIsSending(true);
      setStreamingAnswer('');

      const controller = new AbortController();
      abortRef.current = controller;
      const askedSession = sessionId;
      // 한 번 다른 세션으로 넘어가면 이 스트림은 끝까지 배경 작업으로 남는다.
      // (돌아왔을 때 중간부터 이어 그리면 앞부분이 빈 답변이 되므로, 서버에서 다시 읽는다.)
      let detached = false;

      /** 이 답변을 지금 화면에 그려도 되는가. */
      const stillShown = () => {
        if (detached || controller.signal.aborted) return false;
        if (shownSessionRef.current !== askedSession) {
          detached = true;
          return false;
        }
        return true;
      };

      const appendAnswer = (answer: string, sources: string[]) => {
        if (!stillShown()) return;
        setMessages(prev => [...prev, { role: 'assistant', content: answer, sources }]);
      };

      try {
        let result: chatApi.ChatAnswer;
        try {
          result = await chatApi.streamMessage(sessionId, question, {
            signal: controller.signal,
            onToken: token => {
              if (!stillShown()) return;
              setStreamingAnswer(prev => (prev === null ? token : prev + token));
            },
          });
        } catch (err) {
          if (isAbortError(err)) return; // 창을 닫은 것 — 조용히 끝낸다

          if (
            err instanceof chatApi.StreamHttpError ||
            err instanceof chatApi.StreamAbortedError
          ) {
            // 서버가 이미 질문을 저장했다. 폴백하면 중복되므로 오류로 끝낸다.
            // 다만 도중까지 받은 답변은 서버에도 남아 있으므로 화면에도 남긴다.
            if (err instanceof chatApi.StreamAbortedError && err.partial) {
              appendAnswer(err.partial, []);
            }
            throw err;
          }

          // 서버에 닿지 못한 경우에만 비스트리밍으로 한 번 더 시도한다
          if (stillShown()) setStreamingAnswer('');
          result = await chatApi.sendMessage(sessionId, question);
        }

        appendAnswer(result.answer, result.sources);
      } catch (err) {
        if (isAbortError(err) || !stillShown()) return;
        setError(toErrorMessage(err));
        setFailedQuestion(question);
      } finally {
        if (abortRef.current === controller) abortRef.current = null;

        if (stillShown()) {
          setStreamingAnswer(null);
          setIsSending(false);
        } else if (detached && shownSessionRef.current === askedSession) {
          // 자리를 비운 사이 끝났는데 마침 이 대화로 돌아와 있다 — 서버에서 답변을 가져온다
          reload();
        }
      }
    },
    [sessionId, isSending, reload],
  );

  const send = useCallback((rawInput: string) => request(rawInput.trim(), true), [request]);

  /** 진행 중인 스트림을 끊는다 (창을 닫는 등 화면을 떠날 때).
   *  받다 만 답변은 서버가 저장하므로, 다시 열 때 reload()로 되찾는다. */
  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  // 실패한 질문 재전송 — 사용자 메시지는 이미 목록에 있으므로 다시 붙이지 않는다
  const retry = useCallback(() => {
    if (failedQuestion) void request(failedQuestion, false);
  }, [failedQuestion, request]);

  return {
    messages,
    isSending,
    isLoading,
    error,
    streamingAnswer,
    send,
    retry,
    cancel,
    reload,
    canRetry: failedQuestion !== null,
  };
}
