import React from 'react';
import { useChatWidget } from '../../contexts/ChatWidgetContext';
import { useChatConversation } from './useChatConversation';
import ChatMessages from './ChatMessages';
import ChatComposer from './ChatComposer';
import './ChatWidget.css';

/** 모든 페이지에서 열 수 있는 전역 튜터 챗. */
const ChatWidget: React.FC = () => {
  const { isOpen, toggleChat, closeChat } = useChatWidget();
  const { messages, isSending, error, send } = useChatConversation();

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

          <ChatMessages
            messages={messages}
            isSending={isSending}
            error={error}
            emptyHint={
              <>
                React에 대해 궁금한 것을 물어보세요.
                <br />
                예: &ldquo;useState가 뭐야?&rdquo;
              </>
            }
          />

          <ChatComposer onSend={send} disabled={isSending} />
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
