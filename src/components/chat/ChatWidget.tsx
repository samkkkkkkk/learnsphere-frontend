import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useChatWidget } from '../../contexts/ChatWidgetContext';
import { useAuth } from '../../contexts/AuthContext';
import * as chatApi from '../../api/chatApi';
import type { ChatSession } from '../../api/chatApi';
import { useChatConversation } from './useChatConversation';
import ChatMessages from './ChatMessages';
import ChatComposer from './ChatComposer';
import ConfirmModal from '../ui/ConfirmModal';
import './ChatWidget.css';

/** 모든 페이지에서 열 수 있는 전역 튜터 챗. */
const ChatWidget: React.FC = () => {
  const { isOpen, toggleChat, closeChat } = useChatWidget();
  const { user } = useAuth();
  const location = useLocation();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [showList, setShowList] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const { messages, isSending, isLoading, error, send } = useChatConversation(activeId);

  const startNewSession = useCallback(async () => {
    const session = await chatApi.createSession();
    setSessions(prev => [session, ...prev]);
    setActiveId(session.id);
    setShowList(false);
  }, []);

  // 창을 열면 내 대화 목록을 불러오고, 없으면 새 대화를 만든다
  useEffect(() => {
    if (!isOpen || !user) return;

    let cancelled = false;
    chatApi
      .fetchSessions()
      .then(loaded => {
        if (cancelled) return;
        setSessions(loaded);
        // 레슨에 묶인 세션은 사이드패널 몫이므로 전역 목록에서는 고르지 않는다
        const general = loaded.find(session => session.lesson_id === null);
        if (general) {
          setActiveId(prev => prev ?? general.id);
        } else {
          void startNewSession();
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [isOpen, user, startNewSession]);

  const handleDelete = async (sessionId: number) => {
    setPendingDeleteId(null);
    await chatApi.deleteSession(sessionId);
    setSessions(prev => prev.filter(session => session.id !== sessionId));
    if (activeId === sessionId) setActiveId(null);
  };

  // 첫 질문을 보내면 목록의 제목도 따라 바뀌도록 갱신한다
  const handleSend = async (message: string) => {
    await send(message);
    setSessions(await chatApi.fetchSessions());
  };

  const renderBody = () => {
    if (!user) {
      return (
        <div className="chat-panel__messages">
          <p className="chat-panel__empty">
            튜터에게 질문하려면 로그인이 필요합니다.
            <br />
            <Link to="/login" state={{ from: location.pathname }} onClick={closeChat} className="chat-panel__login-link">
              로그인하러 가기
            </Link>
          </p>
        </div>
      );
    }

    return (
      <>
        {showList && (
          <ul className="chat-session-list">
            {sessions.filter(session => session.lesson_id === null).map(session => (
              <li
                key={session.id}
                className={`chat-session-item ${session.id === activeId ? 'active' : ''}`}
              >
                <button
                  className="chat-session-item__open"
                  onClick={() => {
                    setActiveId(session.id);
                    setShowList(false);
                  }}
                >
                  {session.title ?? '새 대화'}
                </button>
                <button
                  className="chat-session-item__delete"
                  onClick={() => setPendingDeleteId(session.id)}
                  title="대화 삭제"
                  aria-label="대화 삭제"
                >
                  &times;
                </button>
              </li>
            ))}
            {sessions.filter(session => session.lesson_id === null).length === 0 && (
              <li className="chat-session-item chat-session-item--empty">
                아직 대화가 없습니다.
              </li>
            )}
          </ul>
        )}

        <ChatMessages
          messages={messages}
          isSending={isSending || isLoading}
          error={error}
          emptyHint={
            <>
              React에 대해 궁금한 것을 물어보세요.
              <br />
              예: &ldquo;useState가 뭐야?&rdquo;
            </>
          }
        />

        <ChatComposer onSend={handleSend} disabled={isSending || activeId === null} />
      </>
    );
  };

  return (
    <>
      {isOpen && (
        <div className="chat-panel">
          <div className="chat-panel__header">
            <span>AI 튜터</span>
            <div className="chat-panel__actions">
              {user && (
                <>
                  <button
                    className="chat-panel__action"
                    onClick={() => setShowList(prev => !prev)}
                    title="대화 목록"
                  >
                    ☰
                  </button>
                  <button
                    className="chat-panel__action"
                    onClick={() => void startNewSession()}
                    title="새 대화"
                  >
                    ✚
                  </button>
                </>
              )}
              <button className="chat-panel__close" onClick={closeChat} title="닫기">
                &times;
              </button>
            </div>
          </div>

          {renderBody()}
        </div>
      )}

      <button className="chat-fab" onClick={toggleChat} title="AI 튜터에게 질문하기" aria-label="AI 튜터에게 질문하기">
        <span role="img" aria-hidden="true">
          💬
        </span>
      </button>

      <ConfirmModal
        open={pendingDeleteId !== null}
        title="대화 삭제"
        message="이 대화를 삭제하면 되돌릴 수 없습니다. 삭제할까요?"
        confirmLabel="삭제"
        danger
        onConfirm={() => {
          if (pendingDeleteId !== null) void handleDelete(pendingDeleteId);
        }}
        onCancel={() => setPendingDeleteId(null)}
      />
    </>
  );
};

export default ChatWidget;
