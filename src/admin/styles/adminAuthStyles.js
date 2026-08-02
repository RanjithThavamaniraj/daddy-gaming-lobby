/**
 * Isolated styles for admin auth screens (Phase 2).
 * Does not affect the public website.
 */
export const adminAuthStyles = `
  .admin-auth-shell {
    min-height: 100vh;
    background: #060608;
    color: #f0f0f5;
    font-family: 'Rajdhani', sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
  }

  .admin-auth-card {
    width: min(100%, 420px);
    background: linear-gradient(160deg, rgba(168,85,247,.08), rgba(255,255,255,.02));
    border: 1px solid rgba(168,85,247,.2);
    border-radius: 20px;
    padding: 2rem 1.75rem;
    box-shadow: 0 20px 48px rgba(0,0,0,.35);
  }

  .admin-auth-eyebrow {
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #6b7280;
    margin-bottom: 0.75rem;
  }

  .admin-auth-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 1.35rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #e9d5ff;
    margin-bottom: 0.5rem;
  }

  .admin-auth-copy {
    color: #9ca3af;
    font-size: 0.95rem;
    line-height: 1.55;
    margin-bottom: 1.5rem;
  }

  .admin-auth-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .admin-auth-label {
    display: block;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #9ca3af;
    margin-bottom: 0.4rem;
  }

  .admin-auth-input {
    width: 100%;
    box-sizing: border-box;
    background: rgba(0,0,0,.35);
    border: 1px solid rgba(255,255,255,.1);
    border-radius: 10px;
    color: #f0f0f5;
    font: inherit;
    font-size: 1rem;
    padding: 0.75rem 0.9rem;
    outline: none;
  }

  .admin-auth-input:focus {
    border-color: rgba(168,85,247,.55);
    box-shadow: 0 0 0 3px rgba(168,85,247,.15);
  }

  .admin-auth-submit,
  .admin-auth-secondary {
    border: none;
    border-radius: 10px;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    cursor: pointer;
    padding: 0.85rem 1rem;
  }

  .admin-auth-submit {
    background: linear-gradient(135deg, #a855f7, #7c3aed);
    color: #fff;
    margin-top: 0.35rem;
  }

  .admin-auth-submit:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .admin-auth-secondary {
    background: transparent;
    color: #c084fc;
    border: 1px solid rgba(168,85,247,.35);
  }

  .admin-auth-error {
    background: rgba(239,68,68,.1);
    border: 1px solid rgba(239,68,68,.35);
    color: #fca5a5;
    border-radius: 10px;
    padding: 0.75rem 0.9rem;
    font-size: 0.9rem;
    line-height: 1.45;
  }

  .admin-auth-loading {
    min-height: 100vh;
    display: grid;
    place-items: center;
    background: #060608;
    color: #9ca3af;
    font-family: 'Rajdhani', sans-serif;
    letter-spacing: 0.06em;
  }

  .admin-home-actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1.25rem;
  }

  .admin-home-meta {
    font-size: 0.85rem;
    color: #6b7280;
    word-break: break-all;
  }
`;
