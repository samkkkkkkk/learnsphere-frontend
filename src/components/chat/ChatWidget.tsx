import React, { useEffect, useRef, useState } from 'react';
import { useChatWidget } from '../../contexts/ChatWidgetContext';
import { sendMessage } from '../../api/chatApi';
import type { ChatMessage } from '../../api/chatApi';
import MarkdownRenderer from '../MarkdownRenderer';
import './ChatWidget.css';

const ChatWidget: React.FC = () => {
  const { isOpen, toggleChat, closeChat } = useChatWidget();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 새 메시지가 붙으면 항상 최신 대화가 보이도록 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || isSending) return;

    // 이번 질문을 붙이기 전의 대화가 서버로 보낼 history가 된다
    const history = messages;
    setMessages(prev => [...prev, { role: 'user', content: question }]);
    setInput('');
    setError(null);
    setIsSending(true);

    try {
      const answer = await sendMessage(question, history);
      setMessages(prev => [...prev, { role: 'assistant', content: answer }]);
    } catch {
      setError('답변을 가져오지 못했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSending(false);
    }
  };

  // Enter 전송, Shift+Enter 줄바꿈
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit(e);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="chat-panel">
          <div className="chat-panel__header">
            <span>AI 튜터</span>
            <button className="chat-panel__close" onClick={closeChat} title="닫기">
              &times;
            </button>
          </div>

          <div className="chat-panel__messages">
            {messages.length === 0 && !isSending && (
              <p className="chat-panel__empty">
                React에 대해 궁금한 것을 물어보세요.
                <br />
                예: &ldquo;useState가 뭐야?&rdquo;
              </p>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`chat-message chat-message--${message.role}`}
              >
                {message.role === 'assistant' ? (
                  <MarkdownRenderer>{message.content}</MarkdownRenderer>
                ) : (
                  message.content
                )}
              </div>
            ))}

            {isSending && (
              <div className="chat-message chat-message--assistant">답변을 작성하고 있어요…</div>
            )}

            {error && <div className="chat-message chat-message--error">{error}</div>}

            <div ref={messagesEndRef} />
          </div>

          <form className="chat-panel__form" onSubmit={handleSubmit}>
            <textarea
              className="chat-panel__input"
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="질문을 입력하세요"
              disabled={isSending}
            />
            <button
              type="submit"
              className="chat-panel__send"
              disabled={isSending || !input.trim()}
            >
              전송
            </button>
          </form>
        </div>
      )}

      <button className="chat-fab" onClick={toggleChat} title="AI 튜터에게 질문하기">
        <span role="img" aria-label="chat">
          💬
        </span>
      </button>
    </>
  );
};

export default ChatWidget;
