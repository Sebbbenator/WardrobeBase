import Icon from './Icon.jsx';

export default function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="mb-4 flex items-start justify-between gap-3 rounded-2xl border border-terracotta/30 bg-terracotta/10 px-4 py-3 text-sm text-terracotta"
    >
      <div className="flex gap-2">
        <span aria-hidden="true">⚠︎</span>
        <span className="leading-snug">{message}</span>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-full p-1 text-terracotta/70 hover:bg-terracotta/10 hover:text-terracotta"
          aria-label="Dismiss"
        >
          <Icon name="close" className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
