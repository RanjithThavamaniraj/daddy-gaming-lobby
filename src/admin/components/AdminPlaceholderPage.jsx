import { useAdmin } from "../auth/useAdmin";

/**
 * Reusable placeholder content for unfinished admin sections.
 * @param {object} props
 * @param {string} props.title
 * @param {string} props.description
 */
export default function AdminPlaceholderPage({ title, description }) {
  useAdmin();

  return (
    <section>
      <header className="admin-page-header">
        <p className="admin-page-eyebrow">Admin</p>
        <h1 className="admin-page-title">{title}</h1>
        <p className="admin-page-copy">{description}</p>
      </header>

      <div className="admin-placeholder-panel">
        <span className="admin-placeholder-badge">Coming soon</span>
        <p className="admin-page-copy">
          This section is wired into the admin shell. Functionality will arrive
          in a later phase.
        </p>
      </div>
    </section>
  );
}
