/**
 * Lightweight inline icon set. All icons render as currentColor, 24×24 by default.
 * Keeping them local avoids a dependency and keeps bundles small.
 */
const ICONS = {
  hanger: (
    <>
      <path d="M12 4a2 2 0 1 0 0 4c.9 0 1.2.6 1.2 1 0 .5-.3.9-.9 1.2L4 14.5a2 2 0 0 0-1 1.7V18a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-1.8a2 2 0 0 0-1-1.7l-8.3-4.3c-.6-.3-.9-.7-.9-1.2 0-.5.4-1 1-1 1.7 0 3-1.3 3-3" />
    </>
  ),
  sparkles: (
    <>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2 2M16 16l2 2M18 6l-2 2M8 16l-2 2" />
      <path d="M12 8l1.6 2.4L16 12l-2.4 1.6L12 16l-1.6-2.4L8 12l2.4-1.6L12 8Z" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14M5 12h14" />
    </>
  ),
  camera: (
    <>
      <path d="M3 7a2 2 0 0 1 2-2h2l2-2h6l2 2h2a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
      <circle cx="12" cy="13" r="4" />
    </>
  ),
  close: (
    <>
      <path d="M6 6l12 12M18 6L6 18" />
    </>
  ),
  check: (
    <>
      <path d="M4 12l5 5L20 6" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13M10 11v7M14 11v7" />
    </>
  ),
  refresh: (
    <>
      <path d="M21 12a9 9 0 1 1-3-6.7M21 3v6h-6" />
    </>
  ),
  chevronRight: (
    <>
      <path d="M9 6l6 6-6 6" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.2 4.2M7 7C4.5 8.7 3 12 3 12s3.5 7 10 7c2 0 3.8-.6 5.3-1.5M9.9 5.1A9 9 0 0 1 12 5c6.5 0 10 7 10 7-.5.9-1.3 2-2.4 3" />
    </>
  ),
  wand: (
    <>
      <path d="M15 4V2M15 10V8M11 6H9M17 6h2M14.8 5.2l-1.4-1.4M16.6 7l1.4 1.4M3 21l9-9" />
    </>
  ),
};

export default function Icon({ name, className = 'h-5 w-5', strokeWidth = 1.6, ...rest }) {
  const path = ICONS[name];
  if (!path) return null;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {path}
    </svg>
  );
}
