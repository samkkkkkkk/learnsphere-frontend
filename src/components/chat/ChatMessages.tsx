import React, { useEffect, useRef } from 'react';
import type { ChatMessage } from '../../api/chatApi';
import MarkdownRenderer from '../MarkdownRenderer';
import Spinner from '../ui/Spinner';

interface ChatMessagesProps {
  messages: ChatMessage[];
  /** 답변 생성 중 (타이핑 인디케이터 표시) */
  isSending: boolean;
  /** 지난 대화 불러오는 중 (isSending과 구분 표시) */
  isLoading?: boolean;
  error: string | null;
  emptyHint: React.ReactNode;
  /** 전송 실패 시 재시도 핸들러 — 있으면 오류 아래 재시도 버튼 표시 */
  onRetry?: (() => void) | null;
  /** 빈 화면에서 클릭 한 번으로 보낼 수 있는 예시 질문 */
  suggestions?: string[];
  onSuggestion?: (question: string) => void;
}

/**
 * 대화 목록 렌더링.
 *
 * 전역 플로팅 위젯(ChatWidget)과 레슨 사이드패널(LessonChatPanel)이 공유한다.
 */
const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  isSending,
  isLoading = false,
  error,
  emptyHint,
  onRetry,
  suggestions,
  onSuggestion,
}) => {
  const listRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  // 사용자가 위로 스크롤해 과거 대화를 읽는 중에는 자동 스크롤을 멈춘다
  const stickToBottomRef = useRef(true);

  const handleScroll = () => {
    const el = listRef.current;
    if (!el) return;
    stickToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
  };

  useEffect(() => {
    if (stickToBottomRef.current) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isSending]);

  const showEmpty = messages.length === 0 && !isSending && !isLoading;

  return (
    <div
      ref={listRef}
      className="chat-panel__messages"
      onScroll={handleScroll}
      aria-live="polite"
    >
      {isLoading && <Spinner size="sm" label="지난 대화를 불러오는 중" />}

      {showEmpty && (
        <div className="chat-panel__empty">
          {emptyHint}
          {suggestions && suggestions.length > 0 && onSuggestion && (
            <div className="chat-suggestions">
              {suggestions.map(question => (
                <button
                  key={question}
                  type="button"
                  className="chat-suggestion"
                  onClick={() => onSuggestion(question)}
                >
                  {question}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {messages.map((message, index) => (
        <div key={index} className={`chat-message chat-message--${message.role}`}>
          {message.role === 'assistant' ? (
            <MarkdownRenderer>{message.content}</MarkdownRenderer>
          ) : (
            message.content
          )}

          {message.sources && message.sources.length > 0 && (
            <div className="chat-message__sources">
              <span className="chat-message__sources-label">참고 문서</span>
              {message.sources.map(source => (
                <span key={source} className="chat-message__source">
                  {source}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}

      {isSending && (
        <div className="chat-typing" aria-label="답변을 작성하고 있어요">
          <i /><i /><i />
        </div>
      )}

      {error && <div className="chat-message chat-message--error">{error}</div>}
      {error && onRetry && (
        <button type="button" className="chat-retry" onClick={onRetry}>
          다시 시도
        </button>
      )}

      <div ref={endRef} />
    </div>
  );
};

export default ChatMessages;
