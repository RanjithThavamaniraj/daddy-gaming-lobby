export default function GameIcon({ slug }) {
  const icons = {
    "arc-raiders": (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden>
        <path d="M16 4L28 26H4L16 4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="16" cy="18" r="3" fill="currentColor" />
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
        <circle cx="16" cy="16" r="8" stroke="currentColor" strokeWidth="2" />
        <path
          d="M16 4v5M16 23v5M4 16h5M23 16h5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="16" cy="16" r="2" fill="currentColor" />
      </svg>
    ),
    "fc-26": (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden>
        <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="2" />
        <path d="M10 16c0-4 2.5-7 6-7s6 3 6 7-2.5 7-6 7-6-3-6-7z" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    "rocket-league": (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden>
        <circle cx="16" cy="16" r="9" stroke="currentColor" strokeWidth="2" />
        <path d="M10 20l6-8 6 8" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    ),
    "among-us": (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden>
        <path d="M12 6h6a8 8 0 018 8v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-8a8 8 0 018-8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M17 11h6v5h-6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    ),
    "fall-guys": (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden>
        <circle cx="16" cy="13" r="7" stroke="currentColor" strokeWidth="2" />
        <path d="M6 26l5-5 5 5 5-5 5 5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    ),
  };

  return icons[slug] ?? icons.valorant;
}
