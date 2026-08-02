/**
 * Isolated styles for admin giveaways (Phase G1).
 */
export const adminGiveawayStyles = `
  .admin-giveaway-stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.85rem;
    margin: 1rem 0 1.25rem;
  }

  .admin-giveaway-stat {
    background: linear-gradient(160deg, rgba(168,85,247,.1), rgba(255,255,255,.02));
    border: 1px solid var(--admin-border, rgba(168,85,247,.18));
    border-radius: 14px;
    padding: 0.95rem 1rem;
  }

  .admin-giveaway-stat-label {
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--admin-dim, #6b7280);
    margin-bottom: 0.4rem;
  }

  .admin-giveaway-stat-value {
    font-family: 'Orbitron', sans-serif;
    font-size: 1.35rem;
    font-weight: 800;
    color: #e9d5ff;
  }

  .admin-tournament-selector {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    max-height: 240px;
    overflow-y: auto;
    border: 1px solid rgba(255,255,255,.1);
    border-radius: 12px;
    padding: 0.65rem;
    background: rgba(0,0,0,.25);
  }

  .admin-tournament-option {
    display: flex;
    align-items: flex-start;
    gap: 0.65rem;
    padding: 0.45rem 0.35rem;
    border-radius: 8px;
    cursor: pointer;
  }

  .admin-tournament-option:hover {
    background: rgba(168,85,247,.08);
  }

  .admin-tournament-option input {
    margin-top: 0.2rem;
  }

  .admin-tournament-option-label {
    font-size: 0.92rem;
    color: #e9d5ff;
    font-weight: 600;
  }

  .admin-tournament-option-meta {
    display: block;
    font-size: 0.8rem;
    color: var(--admin-muted, #9ca3af);
  }

  .admin-eligible-table-wrap {
    overflow-x: auto;
    border: 1px solid var(--admin-border, rgba(168,85,247,.18));
    border-radius: 14px;
    margin-top: 0.75rem;
  }

  .admin-eligible-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.65rem;
    margin-top: 0.85rem;
  }

  .admin-winner-panel {
    margin-top: 1.25rem;
    padding: 1.15rem;
    border-radius: 14px;
    border: 1px solid rgba(134,239,172,.3);
    background: rgba(134,239,172,.06);
  }

  .admin-winner-select {
    width: 100%;
    max-width: 420px;
  }

  .admin-list-header-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 1.25rem;
  }

  @media (max-width: 900px) {
    .admin-giveaway-stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 560px) {
    .admin-giveaway-stats {
      grid-template-columns: 1fr;
    }
  }
`;
