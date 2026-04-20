import { useNavigate, useLocation } from 'react-router-dom';
import Icon from './Icon.jsx';

/**
 * Sticky top bar with editorial serif heading and an optional right-side action.
 * If we're on /settings, the gear icon becomes a close button.
 */
export default function TopBar({ eyebrow, title, subtitle, action }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const onSettings = pathname === '/settings';

  return (
    <div className="sticky top-0 z-10 -mx-4 mb-6 bg-gradient-to-b from-cream via-cream to-cream/70 px-4 pt-safe backdrop-blur md:mx-0 md:px-0">
      <div className="flex items-start justify-between gap-3 pt-5">
        <div className="min-w-0 flex-1">
          {eyebrow && (
            <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.18em] text-ink-muted">
              {eyebrow}
            </p>
          )}
          <h1 className="serif-display truncate">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2 pt-1">
          {action}
          <button
            type="button"
            className="btn-icon"
            onClick={() => navigate(onSettings ? -1 : '/settings')}
            aria-label={onSettings ? 'Close settings' : 'Open settings'}
          >
            <Icon name={onSettings ? 'close' : 'settings'} />
          </button>
        </div>
      </div>
    </div>
  );
}
