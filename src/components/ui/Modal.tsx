import { useEffect, useRef } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import './Modal.css';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  maxWidth?: CSSProperties['maxWidth'];
  className?: string;
}

/**
 * 공용 모달 — Esc 닫기, 포커스 트랩, role="dialog", 오버레이 클릭 닫기,
 * 열림 동안 body 스크롤 잠금, 닫힐 때 이전 포커스 복원.
 */
export default function Modal({ open, onClose, title, children, maxWidth = 560, className = '' }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const lastActiveRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    lastActiveRef.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';

    const getFocusables = () =>
      Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
    (getFocusables()[0] ?? panelRef.current)?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        const focusables = getFocusables();
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
      lastActiveRef.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="ui-modal-overlay" onClick={onClose}>
      <div
        ref={panelRef}
        className={`ui-modal${className ? ` ${className}` : ''}`}
        style={{ maxWidth }}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
      >
        <div className="ui-modal__head">
          {title != null ? <h2 className="ui-modal__title">{title}</h2> : <span />}
          <button className="ui-modal__close" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>
        <div className="ui-modal__body">{children}</div>
      </div>
    </div>
  );
}
