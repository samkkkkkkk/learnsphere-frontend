import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import * as chatApi from '../../api/chatApi';
import { useChatConversation } from './useChatConversation';
import ChatMessages from './ChatMessages';
import ChatComposer from './ChatComposer';
import ChatLoginPrompt from './ChatLoginPrompt';
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
 * 세션이 레슨에 묶이므로, 이 대화의 모든 질문은 해당 레슨 본문을
 * 우선 근거로 삼는다. 같은 레슨에 기존 대화가 있으면 이어간다.
 */
const LessonChatPanel: React.FC<LessonChatPanelProps> = ({
  lessonId,
  lessonTitle,
  onClose,
}) => {
  const { user } = useAuth();
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const { messages, isSending, isLoading, error, send, retry, canRetry } =
    useChatConversation(sessionId);

  // 이 레슨의 기존 대화를 찾고, 없으면 새로 만든다
  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    (async () => {
      try {
        const sessions = await chatApi.fetchSessions();
        if (cancelled) return;

        const existing = sessions.find(session => session.lesson_id === lessonId);
        const session = existing ?? (await chatApi.createSession(lessonId));
        if (!cancelled) setSessionId(session.id);
      } catch {
        if (!cancelled) setSessionError('대화를 시작하지 못했습니다.');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [lessonId, user]);

  return (
    <aside className="lesson-chat-panel">
      <div className="chat-panel__header">
        <span className="lesson-chat-panel__title" title={lessonTitle}>
          {lessonTitle} 질문
        </span>
        <button className="chat-panel__close" onClick={onClose} title="닫기" aria-label="닫기">
          &times;
        </button>
      </div>

      {user ? (
        <>
          <ChatMessages
            messages={messages}
            isSending={isSending}
            isLoading={isLoading}
            error={error ?? sessionError}
            onRetry={canRetry ? retry : null}
            emptyHint={<>이 레슨 내용을 바탕으로 답변합니다.</>}
            suggestions={['여기 나온 예제 더 쉽게 설명해줘', '이 개념을 실무에서 언제 써?']}
            onSuggestion={send}
          />
          <ChatComposer
            onSend={send}
            disabled={isSending || sessionId === null}
            placeholder="이 레슨에 대해 질문하세요"
            autoFocus
          />
        </>
      ) : (
        <ChatLoginPrompt />
      )}
    </aside>
  );
};

export default LessonChatPanel;
