export default function GameIcon({ slug }) {
  const icons = {
    "arc-raiders": (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden>
        <path d="M16 4L28 26H4L16 4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="16" cy="18" r="3" fill="currentColor" />
      </svg>
    ),
    "apex-legends": (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden>
        <path d="M16 6L26 26H6L16 6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M10 22h12" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    "marvel-rivals": (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden>
        <circle cx="11" cy="14" r="6" stroke="currentColor" strokeWidth="2" />
        <circle cx="21" cy="14" r="6" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    valorant: (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden>
        <path d="M8 26L16 6l8 20H8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    ),
    cs2: (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden>
        <rect x="6" y="12" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M10 12V9a6 6 0 0112 0v3" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    lol: (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden>
        <path d="M10 8h12v16H10V8z" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    "dota-2": (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden>
        <path d="M6 16c0-6 4.5-10 10-10s10 4 10 10" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    "fc-26": (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden>
        <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    "the-finals": (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden>
        <path d="M8 22V10l8-4 8 4v12" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  };

  return icons[slug] ?? icons.valorant;
}
