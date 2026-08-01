import './Spinner.css';

interface SpinnerProps {
  /** 스피너 옆에 표시할 안내 문구 */
  label?: string;
  size?: 'sm' | 'md';
}

export default function Spinner({ label, size = 'md' }: SpinnerProps) {
  return (
    <div className={`ui-spinner ui-spinner--${size}`} role="status" aria-live="polite">
      <span className="ui-spinner__circle" aria-hidden="true" />
      {label && <span className="ui-spinner__label">{label}</span>}
    </div>
  );
}
