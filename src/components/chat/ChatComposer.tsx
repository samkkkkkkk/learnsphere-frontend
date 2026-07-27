import React, { useEffect, useRef, useState } from 'react';

interface ChatComposerProps {
  onSend: (message: string) => void | Promise<void>;
  disabled: boolean;
  placeholder?: string;
  /** 패널이 열릴 때 입력창에 자동 포커스 */
  autoFocus?: boolean;
}

/** 질문 입력창. Enter로 전송, Shift+Enter로 줄바꿈. */
const ChatComposer: React.FC<ChatComposerProps> = ({
  onSend,
  disabled,
  placeholder = '질문을 입력하세요',
  autoFocus = false,
}) => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const submit = () => {
    if (!input.trim() || disabled) return;
    void onSend(input);
    setInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <form className="chat-panel__form" onSubmit={handleSubmit}>
      <textarea
        ref={inputRef}
        className="chat-panel__input"
        rows={1}
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        aria-label="질문 입력"
      />
      <button type="submit" className="chat-panel__send" disabled={disabled || !input.trim()}>
        전송
      </button>
    </form>
  );
};

export default ChatComposer;
