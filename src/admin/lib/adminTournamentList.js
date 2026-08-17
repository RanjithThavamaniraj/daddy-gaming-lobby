/**
 * Pure helpers for the admin tournament list (no Supabase).
 */

/** @typedef {{
 *   id: string,
 *   slug: string | null,
 *   globalNumber: number,
 *   tournamentNumber: string,
 *   championshipName: string,
 *   championshipLabel: string,
 *   gameChampionshipNumber: number | null,
 *   game: string,
 *   gameSlug: string | null,
 *   status: string,
 *   isFeatured: boolean,
 *   isArchived: boolean,
 *   registrationLimit: number | null,
 *   registrationOpensAt: string | null,
 *   startsAt: string | null,
 *   createdAt: string | null,
 *   eventType: string,
 * }} AdminTournamentRow */

export const ADMIN_TOURNAMENT_STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "coming_soon", label: "Coming Soon" },
  { value: "registration_open", label: "Registrations Open" },
  { value: "registration_closed", label: "Registrations Closed" },
  { value: "active", label: "Active / Live" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export const ADMIN_TOURNAMENT_SORT_OPTIONS = [
  { value: "global_number_desc", label: "Tournament # (high → low)" },
  { value: "global_number_asc", label: "Tournament # (low → high)" },
  { value: "starts_at_desc", label: "Start date (newest)" },
  { value: "starts_at_asc", label: "Start date (oldest)" },
  { value: "created_at_desc", label: "Created (newest)" },
  { value: "created_at_asc", label: "Created (oldest)" },
  { value: "championship_asc", label: "Championship (A → Z)" },
  { value: "game_asc", label: "Game (A → Z)" },
  { value: "status_asc", label: "Status (A → Z)" },
];

export const ADMIN_TOURNAMENT_PAGE_SIZE = 10;

/** @type {Record<string, string>} */
const STATUS_LABELS = {
  draft: "Draft",
  coming_soon: "Coming Soon",
  registration_open: "Registrations Open",
  registration_closed: "Registrations Closed",
  active: "Live",
  completed: "Completed",
  cancelled: "Cancelled",
};

/**
 * @param {string | null | undefined} status
 * @returns {string}
 */
export function formatAdminStatus(status) {
  return STATUS_LABELS[status ?? ""] ?? status ?? "—";
}

/**
 * @param {string | null | undefined} iso
 * @returns {string}
 */
export function formatAdminDateTime(iso) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * @param {string | null | undefined} iso
 * @returns {string}
 */
export function formatAdminDate(iso) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * @param {AdminTournamentRow[]} rows
 * @param {string} query
 * @returns {AdminTournamentRow[]}
 */
export function filterTournamentsBySearch(rows, query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return rows;

  return rows.filter((row) => {
    const haystack = [
      row.tournamentNumber,
      String(row.globalNumber),
      row.championshipName,
      row.game,
      row.slug ?? "",
      formatAdminStatus(row.status),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(needle);
  });
}

/**
 * @param {AdminTournamentRow[]} rows
 * @param {string} status
 * @returns {AdminTournamentRow[]}
 */
export function filterTournamentsByStatus(rows, status) {
  if (!status || status === "all") return rows;
  return rows.filter((row) => row.status === status);
}

/**
 * @param {string | null | undefined} iso
 * @returns {number}
 */
function timeValue(iso) {
  if (!iso) return 0;
  const value = new Date(iso).getTime();
  return Number.isNaN(value) ? 0 : value;
}

/**
 * @param {AdminTournamentRow[]} rows
 * @param {string} sortKey
 * @returns {AdminTournamentRow[]}
 */
export function sortAdminTournaments(rows, sortKey) {
  const sorted = [...rows];

  sorted.sort((a, b) => {
    switch (sortKey) {
      case "global_number_asc":
        return (a.globalNumber ?? Number.POSITIVE_INFINITY) - (b.globalNumber ?? Number.POSITIVE_INFINITY);
      case "starts_at_desc":
        return timeValue(b.startsAt) - timeValue(a.startsAt);
      case "starts_at_asc":
        return timeValue(a.startsAt) - timeValue(b.startsAt);
      case "created_at_desc":
        return timeValue(b.createdAt) - timeValue(a.createdAt);
      case "created_at_asc":
        return timeValue(a.createdAt) - timeValue(b.createdAt);
      case "championship_asc":
        return a.championshipName.localeCompare(b.championshipName);
      case "game_asc":
        return a.game.localeCompare(b.game);
      case "status_asc":
        return formatAdminStatus(a.status).localeCompare(formatAdminStatus(b.status));
      case "global_number_desc":
      default:
        return (b.globalNumber ?? Number.NEGATIVE_INFINITY) - (a.globalNumber ?? Number.NEGATIVE_INFINITY);
    }
  });

  return sorted;
}

/**
 * @param {AdminTournamentRow[]} rows
 * @param {object} options
 * @param {string} [options.search]
 * @param {string} [options.status]
 * @param {string} [options.sort]
 * @param {number} [options.page]
 * @param {number} [options.pageSize]
 */
export function processAdminTournamentList(
  rows,
  {
    search = "",
    status = "all",
    sort = "global_number_desc",
    page = 1,
    pageSize = ADMIN_TOURNAMENT_PAGE_SIZE,
  } = {}
) {
  const filtered = sortAdminTournaments(
    filterTournamentsByStatus(filterTournamentsBySearch(rows, search), status),
    sort
  );

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  const pageRows = filtered.slice(start, start + pageSize);

  return {
    rows: pageRows,
    total,
    page: safePage,
    totalPages,
    pageSize,
  };
}
