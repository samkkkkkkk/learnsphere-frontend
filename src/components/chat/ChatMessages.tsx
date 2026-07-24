import React, { useEffect, useRef } from 'react';
import type { ChatMessage } from '../../api/chatApi';
import MarkdownRenderer from '../MarkdownRenderer';

interface ChatMessagesProps {
  messages: ChatMessage[];
  isSending: boolean;
  error: string | null;
  emptyHint: React.ReactNode;
}

/**
 * 대화 목록 렌더링.
 *
 * 전역 플로팅 위젯(ChatWidget)과 레슨 사이드패널(LessonChatPanel)이 공유한다.
 */
const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  isSending,
  error,
  emptyHint,
}) => {
  const endRef = useRef<HTMLDivElement>(null);

  // 새 메시지가 붙으면 항상 최신 대화가 보이도록 스크롤
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  return (
    <div className="chat-panel__messages">
      {messages.length === 0 && !isSending && (
        <div className="chat-panel__empty">{emptyHint}</div>
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
        <div className="chat-message chat-message--assistant">답변을 작성하고 있어요…</div>
      )}

      {error && <div className="chat-message chat-message--error">{error}</div>}

      <div ref={endRef} />
    </div>
  );
};

export default ChatMessages;
