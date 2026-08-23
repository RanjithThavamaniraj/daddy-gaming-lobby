/**
 * UI helpers for which lifecycle actions to offer.
 * Legal transition enforcement lives in tournamentRepository.
 */

/** @typedef {{
 *   status?: string,
 *   isFeatured?: boolean,
 *   isArchived?: boolean,
 * }} TournamentLifecycleMeta */

/**
 * @param {TournamentLifecycleMeta | null | undefined} meta
 * @property {boolean} [isArchived]
 * @returns {{
 *   publish: boolean,
 *   openRegistration: boolean,
 *   closeRegistration: boolean,
 *   startTournament: boolean,
 *   completeTournament: boolean,
 *   featureTournament: boolean,
 *   archiveTournament: boolean,
 *   restoreTournament: boolean,
 *   cancelTournament: boolean,
 *   duplicateTournament: boolean,
 * }}
 */
export function getAvailableLifecycleActions(meta) {
  const status = meta?.status ?? "";
  const isArchived = Boolean(meta?.isArchived);
  const isFeatured = Boolean(meta?.isFeatured);

  if (isArchived) {
    return {
      publish: false,
      openRegistration: false,
      closeRegistration: false,
      startTournament: false,
      completeTournament: false,
      featureTournament: false,
      archiveTournament: false,
      restoreTournament: true,
      cancelTournament: false,
      duplicateTournament: true,
    };
  }

  const canMutateStatus = status !== "cancelled" && status !== "completed";

  return {
    publish: status === "draft",
    openRegistration: status === "coming_soon",
    closeRegistration: status === "registration_open",
    startTournament:
      status === "registration_open" || status === "registration_closed",
    completeTournament: status === "active",
    featureTournament:
      !isFeatured &&
      ["coming_soon", "registration_open", "registration_closed", "active"].includes(
        status
      ),
    archiveTournament: true,
    restoreTournament: false,
    cancelTournament: canMutateStatus,
    duplicateTournament: true,
  };
}

/** @type {{ id: string, label: string, description: string, tone?: string, confirm?: string }[]} */
export const LIFECYCLE_ACTION_DEFS = [
  {
    id: "publish",
    label: "Publish",
    description: "Draft → Coming Soon (visible as upcoming)",
  },
  {
    id: "openRegistration",
    label: "Open Registration",
    description: "Coming Soon → Registrations Open",
  },
  {
    id: "closeRegistration",
    label: "Close Registration",
    description: "Registrations Open → Registrations Closed",
  },
  {
    id: "startTournament",
    label: "Start Tournament",
    description: "Move to Live / Active",
  },
  {
    id: "completeTournament",
    label: "Complete Tournament",
    description: "Active → Completed",
    confirm: "Mark this tournament as completed?",
  },
  {
    id: "featureTournament",
    label: "Set as Featured",
    description: "Main Event slot (DB trigger unfeatures others)",
  },
  {
    id: "archiveTournament",
    label: "Archive",
    description: "Hide from admin lists (status unchanged)",
    tone: "danger",
    confirm: "Archive this tournament? Status will not change.",
  },
  {
    id: "restoreTournament",
    label: "Restore",
    description: "Return to admin lists without creating a new record",
    confirm: "Restore this tournament from the archive?",
  },
  {
    id: "cancelTournament",
    label: "Cancel",
    description: "Set status to Cancelled",
    tone: "danger",
    confirm: "Cancel this tournament? This cannot be undone in this phase.",
  },
  {
    id: "duplicateTournament",
    label: "Duplicate",
    description: "Create a new draft copy with new IDs",
  },
];
