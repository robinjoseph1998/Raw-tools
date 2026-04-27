export default function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div className={`toast ${visible ? 'is-visible' : ''}`} role="status" aria-live="polite">
      <svg className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path d="M5 13l4 4L19 7" />
      </svg>
      <span>{message}</span>
    </div>
  );
}
