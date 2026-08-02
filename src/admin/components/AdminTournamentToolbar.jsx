import {
  ADMIN_TOURNAMENT_SORT_OPTIONS,
  ADMIN_TOURNAMENT_STATUS_OPTIONS,
} from "../lib/adminTournamentList";

/**
 * Search / status / sort controls for the tournament list.
 * @param {object} props
 * @param {string} props.search
 * @param {(value: string) => void} props.onSearchChange
 * @param {string} props.status
 * @param {(value: string) => void} props.onStatusChange
 * @param {string} props.sort
 * @param {(value: string) => void} props.onSortChange
 */
export default function AdminTournamentToolbar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  sort,
  onSortChange,
}) {
  return (
    <div className="admin-toolbar">
      <div className="admin-toolbar-field">
        <label className="admin-toolbar-label" htmlFor="admin-tournament-search">
          Search
        </label>
        <input
          id="admin-tournament-search"
          className="admin-toolbar-input"
          type="search"
          placeholder="Number, championship, game…"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className="admin-toolbar-field">
        <label className="admin-toolbar-label" htmlFor="admin-tournament-status">
          Status
        </label>
        <select
          id="admin-tournament-status"
          className="admin-toolbar-select"
          value={status}
          onChange={(event) => onStatusChange(event.target.value)}
        >
          {ADMIN_TOURNAMENT_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="admin-toolbar-field">
        <label className="admin-toolbar-label" htmlFor="admin-tournament-sort">
          Sort
        </label>
        <select
          id="admin-tournament-sort"
          className="admin-toolbar-select"
          value={sort}
          onChange={(event) => onSortChange(event.target.value)}
        >
          {ADMIN_TOURNAMENT_SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
