import { NavLink } from 'react-router-dom';
import Icon from './Icon.jsx';

const TABS = [
  { to: '/', icon: 'hanger', label: 'Closet', end: true },
  { to: '/builder', icon: 'sparkles', label: 'Build' },
  { to: '/outfits', icon: 'grid', label: 'Looks' },
  { to: '/not-worn', icon: 'clock', label: 'Stale' },
];

export default function BottomNav() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-20 flex justify-center px-4 pb-safe"
    >
      <div className="mb-3 flex w-full max-w-md items-stretch gap-1 rounded-full border border-line bg-white/95 p-1.5 shadow-lift backdrop-blur">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              [
                'flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full py-2 text-[11px] font-medium transition',
                isActive
                  ? 'bg-ink text-cream'
                  : 'text-ink-muted hover:text-ink',
              ].join(' ')
            }
          >
            <Icon name={tab.icon} className="h-5 w-5" />
            <span>{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
