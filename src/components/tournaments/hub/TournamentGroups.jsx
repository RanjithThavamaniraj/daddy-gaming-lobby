import PlayerNameLink from "./PlayerNameLink";

/**
 * Group stage cards. Shows announcement placeholder when draw not run.
 * @param {object} props
 * @param {import("../../../lib/supabase/tournamentBracket").TournamentGroup[]} props.groups
 * @param {boolean} props.loading
 * @param {boolean} props.hasGroups
 */
export default function TournamentGroups({ groups, loading, hasGroups }) {
  return (
    <section className="hub-section">
      <h2 className="hub-section-title">Groups</h2>
      {loading ? (
        <p className="hub-muted">Loading groups…</p>
      ) : !hasGroups ? (
        <p className="hub-empty">
          Groups will be announced before the tournament.
        </p>
      ) : (
        <div className="hub-groups-grid">
          {groups.map((group) => (
            <article key={group.id} className="hub-group-card">
              <h3>Group {group.label}</h3>
              <ul className="hub-group-list">
                {group.members.map((m) => (
                  <li key={`${group.id}-${m.seed}`}>
                    <span className="hub-seed">#{m.seed}</span>
                    <PlayerNameLink player={m.player} fallback="TBD" />
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
