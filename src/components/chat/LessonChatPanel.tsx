import React from 'react';
import { useChatConversation } from './useChatConversation';
import ChatMessages from './ChatMessages';
import ChatComposer from './ChatComposer';
import './ChatWidget.css';
import './LessonChatPanel.css';

interface LessonChatPanelProps {
  lessonId: number;
  lessonTitle: string;
  onClose: () => void;
}

/**
 * 레슨 상세 옆에 붙는 질문 패널.
 *
 * 전역 위젯과 달리 lessonId를 함께 보내므로, 보고 있는 레슨 본문이
 * 답변의 우선 근거가 된다.
 */
const LessonChatPanel: React.FC<LessonChatPanelProps> = ({
  lessonId,
  lessonTitle,
  onClose,
}) => {
  // lessonId가 바뀌면 훅 상태가 새로 잡히도록 부모에서 key를 준다
  const { messages, isSending, error, send } = useChatConversation(lessonId);

  return (
    <aside className="lesson-chat-panel">
      <div className="chat-panel__header">
        <span className="lesson-chat-panel__title" title={lessonTitle}>
          {lessonTitle} 질문
        </span>
        <button className="chat-panel__close" onClick={onClose} title="닫기">
          &times;
        </button>
      </div>

      <ChatMessages
        messages={messages}
        isSending={isSending}
        error={error}
        emptyHint={
          <>
            이 레슨 내용을 바탕으로 답변합니다.
            <br />
            예: &ldquo;여기 나온 예제 더 쉽게 설명해줘&rdquo;
          </>
        }
      />

      <ChatComposer
        onSend={send}
        disabled={isSending}
        placeholder="이 레슨에 대해 질문하세요"
      />
    </aside>
  );
};

export default LessonChatPanel;
