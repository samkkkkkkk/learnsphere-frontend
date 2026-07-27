import type { ReactNode } from 'react';
import Modal from './Modal';
import Button from './Button';
import './ConfirmModal.css';

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** true면 확인 버튼을 danger 스타일로 (삭제 등 파괴적 동작) */
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** window.confirm 대체 — 파괴적 동작 전 확인 다이얼로그 */
export default function ConfirmModal({
  open,
  title = '확인',
  message,
  confirmLabel = '확인',
  cancelLabel = '취소',
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title} maxWidth={400}>
      <p className="ui-confirm__message">{message}</p>
      <div className="ui-confirm__actions">
        <Button variant="ghost" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
