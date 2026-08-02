/**
 * Isolated styles for the admin dashboard shell (Phase 3).
 * Does not affect the public website.
 */
export const adminShellStyles = `
  .admin-shell {
    --admin-bg: #060608;
    --admin-panel: rgba(255,255,255,.03);
    --admin-border: rgba(168,85,247,.18);
    --admin-purple: #a855f7;
    --admin-purple-deep: #7c3aed;
    --admin-text: #f0f0f5;
    --admin-muted: #9ca3af;
    --admin-dim: #6b7280;
    --admin-sidebar-w: 248px;
    --admin-topbar-h: 64px;

    min-height: 100vh;
    background:
      radial-gradient(ellipse 80% 50% at 0% 0%, rgba(168,85,247,.12), transparent 55%),
      radial-gradient(ellipse 60% 40% at 100% 0%, rgba(124,58,237,.08), transparent 50%),
      var(--admin-bg);
    color: var(--admin-text);
    font-family: 'Rajdhani', sans-serif;
    display: grid;
    grid-template-columns: var(--admin-sidebar-w) 1fr;
    grid-template-rows: var(--admin-topbar-h) 1fr;
    grid-template-areas:
      "sidebar topbar"
      "sidebar main";
  }

  .admin-sidebar {
    grid-area: sidebar;
    position: sticky;
    top: 0;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: linear-gradient(180deg, rgba(168,85,247,.07), rgba(0,0,0,.25));
    border-right: 1px solid var(--admin-border);
    padding: 1.25rem 0.9rem;
    z-index: 20;
  }

  .admin-sidebar-brand {
    padding: 0.35rem 0.65rem 1.25rem;
    border-bottom: 1px solid rgba(255,255,255,.06);
    margin-bottom: 1rem;
  }

  .admin-sidebar-eyebrow {
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--admin-dim);
    margin-bottom: 0.35rem;
  }

  .admin-sidebar-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.95rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #e9d5ff;
    margin: 0;
  }

  .admin-nav {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    flex: 1;
    overflow-y: auto;
  }

  .admin-nav-link {
    display: block;
    text-decoration: none;
    color: var(--admin-muted);
    font-size: 0.95rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    padding: 0.7rem 0.85rem;
    border-radius: 10px;
    border: 1px solid transparent;
    transition: color .15s ease, background .15s ease, border-color .15s ease;
  }

  .admin-nav-link:hover {
    color: var(--admin-text);
    background: rgba(255,255,255,.04);
  }

  .admin-nav-link.is-active {
    color: #e9d5ff;
    background: rgba(168,85,247,.14);
    border-color: rgba(168,85,247,.35);
  }

  .admin-topbar {
    grid-area: topbar;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0 1.5rem;
    border-bottom: 1px solid rgba(255,255,255,.06);
    background: rgba(6,6,8,.72);
    backdrop-filter: blur(12px);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .admin-topbar-heading {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.82rem;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #e9d5ff;
    margin: 0;
  }

  .admin-topbar-user {
    display: flex;
    align-items: center;
    gap: 0.85rem;
  }

  .admin-topbar-meta {
    text-align: right;
    line-height: 1.25;
  }

  .admin-topbar-label {
    display: block;
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--admin-dim);
  }

  .admin-topbar-email {
    display: block;
    font-size: 0.9rem;
    color: var(--admin-muted);
    max-width: 220px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .admin-topbar-logout {
    border: 1px solid rgba(168,85,247,.35);
    background: transparent;
    color: #c084fc;
    border-radius: 10px;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    cursor: pointer;
    padding: 0.65rem 0.9rem;
  }

  .admin-topbar-logout:hover {
    background: rgba(168,85,247,.12);
  }

  .admin-main {
    grid-area: main;
    padding: 1.5rem 1.75rem 2.5rem;
    min-width: 0;
  }

  .admin-page-header {
    margin-bottom: 1.5rem;
  }

  .admin-page-eyebrow {
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--admin-dim);
    margin-bottom: 0.4rem;
  }

  .admin-page-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 1.45rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #e9d5ff;
    margin: 0 0 0.45rem;
  }

  .admin-page-copy {
    color: var(--admin-muted);
    font-size: 1rem;
    line-height: 1.55;
    margin: 0;
    max-width: 42rem;
  }

  .admin-placeholder-panel {
    background: var(--admin-panel);
    border: 1px solid var(--admin-border);
    border-radius: 16px;
    padding: 1.5rem;
  }

  .admin-placeholder-badge {
    display: inline-block;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #c084fc;
    border: 1px solid rgba(168,85,247,.35);
    border-radius: 999px;
    padding: 0.35rem 0.7rem;
    margin-bottom: 0.85rem;
  }

  .admin-stat-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1rem;
  }

  .admin-stat-card {
    background: linear-gradient(160deg, rgba(168,85,247,.1), rgba(255,255,255,.02));
    border: 1px solid var(--admin-border);
    border-radius: 16px;
    padding: 1.15rem 1.2rem;
    min-height: 118px;
  }

  .admin-stat-label {
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--admin-dim);
    margin-bottom: 0.65rem;
  }

  .admin-stat-value {
    font-family: 'Orbitron', sans-serif;
    font-size: 1.75rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    color: #e9d5ff;
    margin-bottom: 0.35rem;
  }

  .admin-stat-hint {
    font-size: 0.85rem;
    color: var(--admin-muted);
    margin: 0;
  }

  @media (max-width: 1100px) {
    .admin-stat-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 900px) {
    .admin-shell {
      --admin-sidebar-w: 210px;
    }
  }

  @media (max-width: 768px) {
    .admin-shell {
      grid-template-columns: 1fr;
      grid-template-rows: auto auto 1fr;
      grid-template-areas:
        "topbar"
        "sidebar"
        "main";
    }

    .admin-sidebar {
      position: relative;
      height: auto;
      border-right: none;
      border-bottom: 1px solid var(--admin-border);
      padding-bottom: 0.85rem;
    }

    .admin-nav {
      flex-direction: row;
      flex-wrap: wrap;
      gap: 0.35rem;
    }

    .admin-nav-link {
      font-size: 0.85rem;
      padding: 0.55rem 0.7rem;
    }

    .admin-topbar {
      position: relative;
      padding: 0.85rem 1rem;
      flex-wrap: wrap;
    }

    .admin-topbar-email {
      max-width: 140px;
    }

    .admin-main {
      padding: 1.15rem 1rem 2rem;
    }

    .admin-stat-grid {
      grid-template-columns: 1fr;
    }
  }
`;
