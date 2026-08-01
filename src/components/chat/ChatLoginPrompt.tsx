import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface ChatLoginPromptProps {
  /** 로그인 링크 클릭 시 추가 동작 (예: 챗 패널 닫기) */
  onNavigate?: () => void;
}

/** 미로그인 상태의 챗 안내 — 전역 위젯·레슨 패널이 공유한다. */
const ChatLoginPrompt: React.FC<ChatLoginPromptProps> = ({ onNavigate }) => {
  const location = useLocation();

  return (
    <div className="chat-panel__messages">
      <p className="chat-panel__empty">
        튜터에게 질문하려면 로그인이 필요합니다.
        <br />
        <Link
          to="/login"
          state={{ from: location.pathname }}
          onClick={onNavigate}
          className="chat-panel__login-link"
        >
          로그인하러 가기
        </Link>
      </p>
    </div>
  );
};

export default ChatLoginPrompt;
