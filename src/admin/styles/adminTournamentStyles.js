/**
 * Styles for admin tournament list / filters (Phase 4A).
 */
export const adminTournamentStyles = `
  .admin-toolbar {
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) repeat(2, minmax(140px, 0.7fr));
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .admin-toolbar-field {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .admin-toolbar-label {
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--admin-dim, #6b7280);
  }

  .admin-toolbar-input,
  .admin-toolbar-select {
    width: 100%;
    box-sizing: border-box;
    background: rgba(0,0,0,.35);
    border: 1px solid rgba(255,255,255,.1);
    border-radius: 10px;
    color: var(--admin-text, #f0f0f5);
    font: inherit;
    font-size: 0.95rem;
    padding: 0.7rem 0.85rem;
    outline: none;
  }

  .admin-toolbar-input:focus,
  .admin-toolbar-select:focus {
    border-color: rgba(168,85,247,.55);
    box-shadow: 0 0 0 3px rgba(168,85,247,.15);
  }

  .admin-toolbar-select option {
    background: #121214;
    color: #f0f0f5;
  }

  .admin-table-wrap {
    overflow-x: auto;
    border: 1px solid var(--admin-border, rgba(168,85,247,.18));
    border-radius: 16px;
    background: var(--admin-panel, rgba(255,255,255,.03));
  }

  .admin-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 1080px;
  }

  .admin-table th,
  .admin-table td {
    padding: 0.85rem 0.9rem;
    text-align: left;
    vertical-align: top;
    border-bottom: 1px solid rgba(255,255,255,.06);
  }

  .admin-table th {
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--admin-dim, #6b7280);
    white-space: nowrap;
    background: rgba(0,0,0,.25);
  }

  .admin-table td {
    font-size: 0.95rem;
    color: var(--admin-muted, #9ca3af);
  }

  .admin-table tbody tr:hover td {
    background: rgba(168,85,247,.06);
  }

  .admin-table-primary {
    color: #e9d5ff;
    font-weight: 600;
  }

  .admin-table-mono {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.78rem;
    letter-spacing: 0.04em;
    color: #e9d5ff;
  }

  .admin-status-pill {
    display: inline-block;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    border-radius: 999px;
    padding: 0.3rem 0.65rem;
    border: 1px solid rgba(255,255,255,.12);
    color: #d1d5db;
    background: rgba(255,255,255,.04);
    white-space: nowrap;
  }

  .admin-status-pill[data-status="draft"] {
    color: #fcd34d;
    border-color: rgba(252,211,77,.35);
    background: rgba(252,211,77,.08);
  }

  .admin-status-pill[data-status="coming_soon"],
  .admin-status-pill[data-status="registration_open"],
  .admin-status-pill[data-status="registration_closed"] {
    color: #93c5fd;
    border-color: rgba(147,197,253,.35);
    background: rgba(147,197,253,.08);
  }

  .admin-status-pill[data-status="active"] {
    color: #86efac;
    border-color: rgba(134,239,172,.35);
    background: rgba(134,239,172,.08);
  }

  .admin-status-pill[data-status="completed"] {
    color: #c084fc;
    border-color: rgba(192,132,252,.35);
    background: rgba(192,132,252,.08);
  }

  .admin-status-pill[data-status="cancelled"] {
    color: #fca5a5;
    border-color: rgba(252,165,165,.35);
    background: rgba(252,165,165,.08);
  }

  .admin-featured-yes {
    color: #fbbf24;
    font-weight: 700;
  }

  .admin-featured-no {
    color: var(--admin-dim, #6b7280);
  }

  .admin-table-empty,
  .admin-inline-error,
  .admin-inline-loading {
    border: 1px solid var(--admin-border, rgba(168,85,247,.18));
    border-radius: 16px;
    padding: 1.35rem 1.25rem;
    color: var(--admin-muted, #9ca3af);
    background: var(--admin-panel, rgba(255,255,255,.03));
  }

  .admin-inline-error {
    border-color: rgba(239,68,68,.35);
    color: #fca5a5;
    background: rgba(239,68,68,.08);
    margin-bottom: 1rem;
  }

  .admin-pagination {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 1rem;
    flex-wrap: wrap;
  }

  .admin-pagination-meta {
    font-size: 0.9rem;
    color: var(--admin-muted, #9ca3af);
  }

  .admin-pagination-actions {
    display: flex;
    gap: 0.5rem;
  }

  .admin-pagination-btn {
    border: 1px solid rgba(168,85,247,.35);
    background: transparent;
    color: #c084fc;
    border-radius: 10px;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.65rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    cursor: pointer;
    padding: 0.6rem 0.85rem;
  }

  .admin-pagination-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .admin-pagination-btn:not(:disabled):hover {
    background: rgba(168,85,247,.12);
  }

  .admin-mobile-cards {
    display: none;
    flex-direction: column;
    gap: 0.75rem;
  }

  .admin-mobile-card {
    border: 1px solid var(--admin-border, rgba(168,85,247,.18));
    border-radius: 14px;
    background: var(--admin-panel, rgba(255,255,255,.03));
    padding: 1rem;
  }

  .admin-mobile-card-title {
    color: #e9d5ff;
    font-weight: 700;
    margin: 0 0 0.35rem;
  }

  .admin-mobile-card-meta {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.55rem 0.75rem;
    margin-top: 0.75rem;
  }

  .admin-mobile-kv-label {
    display: block;
    font-size: 0.65rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--admin-dim, #6b7280);
    margin-bottom: 0.15rem;
  }

  .admin-mobile-kv-value {
    color: var(--admin-muted, #9ca3af);
    font-size: 0.9rem;
  }

  .admin-mobile-edit {
    display: inline-block;
    margin-top: 0.85rem;
  }

  .admin-table-action {
    color: #c084fc;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.65rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    text-decoration: none;
  }

  .admin-table-action:hover {
    color: #e9d5ff;
  }

  .admin-page-header-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .admin-header-cta {
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    white-space: nowrap;
  }

  .admin-inline-success {
    border: 1px solid rgba(134,239,172,.35);
    border-radius: 16px;
    padding: 1rem 1.15rem;
    color: #86efac;
    background: rgba(134,239,172,.08);
    margin-bottom: 1rem;
  }

  .admin-form {
    max-width: 960px;
  }

  .admin-form-back {
    color: #c084fc;
    text-decoration: none;
  }

  .admin-form-back:hover {
    color: #e9d5ff;
  }

  .admin-form-meta {
    margin: 0.65rem 0 0;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.72rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--admin-dim, #6b7280);
  }

  .admin-form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem 1.15rem;
    margin: 1.25rem 0 1.5rem;
  }

  .admin-form-field {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .admin-form-field.has-error .admin-toolbar-input,
  .admin-form-field.has-error .admin-toolbar-select {
    border-color: rgba(239,68,68,.55);
  }

  .admin-form-hint {
    margin: 0;
    font-size: 0.8rem;
    color: var(--admin-dim, #6b7280);
  }

  .admin-form-error {
    margin: 0;
    font-size: 0.85rem;
    color: #fca5a5;
  }

  .admin-form-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.65rem;
    align-items: center;
  }

  .admin-form-submit {
    border: none;
    border-radius: 10px;
    background: linear-gradient(135deg, #a855f7, #7c3aed);
    color: #fff;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    cursor: pointer;
    padding: 0.85rem 1.15rem;
  }

  .admin-form-submit:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .admin-lifecycle {
    max-width: 960px;
    margin-bottom: 1.75rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid rgba(255,255,255,.06);
  }

  .admin-lifecycle-header {
    margin-bottom: 1rem;
  }

  .admin-lifecycle-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 1.05rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #e9d5ff;
    margin: 0 0 0.4rem;
  }

  .admin-lifecycle-copy {
    margin: 0;
    color: var(--admin-muted, #9ca3af);
    font-size: 0.95rem;
    line-height: 1.5;
  }

  .admin-lifecycle-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.85rem;
  }

  .admin-lifecycle-card {
    background: linear-gradient(160deg, rgba(168,85,247,.08), rgba(255,255,255,.02));
    border: 1px solid var(--admin-border, rgba(168,85,247,.18));
    border-radius: 14px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
  }

  .admin-lifecycle-card.is-danger {
    border-color: rgba(239,68,68,.28);
    background: linear-gradient(160deg, rgba(239,68,68,.08), rgba(255,255,255,.02));
  }

  .admin-lifecycle-action-title {
    margin: 0;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #e9d5ff;
  }

  .admin-lifecycle-action-copy {
    margin: 0;
    flex: 1;
    font-size: 0.88rem;
    color: var(--admin-muted, #9ca3af);
    line-height: 1.45;
  }

  .admin-lifecycle-btn {
    align-self: flex-start;
    border: 1px solid rgba(168,85,247,.4);
    background: rgba(168,85,247,.12);
    color: #e9d5ff;
    border-radius: 10px;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.62rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    padding: 0.65rem 0.85rem;
  }

  .admin-lifecycle-btn:hover:not(:disabled) {
    background: rgba(168,85,247,.22);
  }

  .admin-lifecycle-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .admin-lifecycle-btn.is-danger {
    border-color: rgba(239,68,68,.45);
    background: rgba(239,68,68,.1);
    color: #fca5a5;
  }

  .admin-lifecycle-btn.is-danger:hover:not(:disabled) {
    background: rgba(239,68,68,.18);
  }

  @media (max-width: 900px) {
    .admin-toolbar {
      grid-template-columns: 1fr;
    }

    .admin-table-wrap {
      display: none;
    }

    .admin-mobile-cards {
      display: flex;
    }

    .admin-form-grid {
      grid-template-columns: 1fr;
    }

    .admin-lifecycle-grid {
      grid-template-columns: 1fr;
    }
  }
`;
