/**
 * Live dashboard status cards (read-only counts from repository).
 * @param {object} props
 * @param {{ draft: number, upcoming: number, active: number, completed: number } | null} props.counts
 * @param {boolean} props.loading
 */
export default function AdminDashboardStatCards({ counts, loading }) {
  const cards = [
    {
      id: "draft",
      label: "Draft Tournaments",
      value: counts?.draft,
      hint: "Unpublished drafts",
    },
    {
      id: "upcoming",
      label: "Upcoming",
      value: counts?.upcoming,
      hint: "Coming soon & registration",
    },
    {
      id: "active",
      label: "Active",
      value: counts?.active,
      hint: "Tournaments currently live",
    },
    {
      id: "completed",
      label: "Completed",
      value: counts?.completed,
      hint: "Finished events",
    },
  ];

  return (
    <div className="admin-stat-grid">
      {cards.map((stat) => (
        <article key={stat.id} className="admin-stat-card">
          <p className="admin-stat-label">{stat.label}</p>
          <p className="admin-stat-value">
            {loading ? "…" : (stat.value ?? "—")}
          </p>
          <p className="admin-stat-hint">{stat.hint}</p>
        </article>
      ))}
    </div>
  );
}
