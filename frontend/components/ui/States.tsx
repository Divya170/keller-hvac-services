'use client';

/** Inline error panel with a retry button. */
export function ErrorPanel({ message, onRetry, style }: { message: string; onRetry?: () => void; style?: React.CSSProperties }) {
  return (
    <div role="alert" className="inline-error" style={style}>
      <p>
        <strong>That didn’t load.</strong> {message}
      </p>
      {onRetry && (
        <button type="button" className="small-btn" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function Spinner({ size = 16, color = 'var(--navy)' }: { size?: number; color?: string }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `2px solid ${color}`,
        borderRightColor: 'transparent',
        display: 'inline-block',
        animation: 'kspin .8s linear infinite',
        flex: 'none',
      }}
    />
  );
}
