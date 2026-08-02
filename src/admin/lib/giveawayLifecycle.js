/**
 * UI helpers for which giveaway lifecycle actions to offer.
 * Legal transitions are enforced in giveawayRepository.
 */

/**
 * @param {{ status?: string, isArchived?: boolean, winnerPlayerId?: string | null } | null | undefined} meta
 */
export function getAvailableGiveawayActions(meta) {
  const status = meta?.status ?? "";
  const isArchived = Boolean(meta?.isArchived);

  return {
    publish: !isArchived && status === "draft",
    closeEntries: !isArchived && status === "published",
    recordWinner:
      !isArchived &&
      (status === "entries_closed" || status === "winner_selected"),
    complete: !isArchived && status === "winner_selected",
    cancel:
      !isArchived &&
      !["completed", "cancelled"].includes(status),
    archive: !isArchived,
  };
}

export const GIVEAWAY_ACTION_DEFS = [
  {
    id: "publish",
    label: "Publish",
    description: "Draft → Published (creates giveaway_created activity)",
  },
  {
    id: "closeEntries",
    label: "Close Entries",
    description: "Published → Entries Closed",
  },
  {
    id: "recordWinner",
    label: "Record Winner",
    description: "Record Wheel of Names result from eligible players",
  },
  {
    id: "complete",
    label: "Complete",
    description: "Winner Selected → Completed (giveaway_completed activity)",
    confirm: "Mark this giveaway as completed?",
  },
  {
    id: "cancel",
    label: "Cancel",
    description: "Set status to Cancelled",
    tone: "danger",
    confirm: "Cancel this giveaway?",
  },
  {
    id: "archive",
    label: "Archive",
    description: "Hide from admin lists (status unchanged)",
    tone: "danger",
    confirm: "Archive this giveaway?",
  },
];

/** @type {Record<string, string>} */
export const GIVEAWAY_STATUS_LABELS = {
  draft: "Draft",
  published: "Published",
  entries_closed: "Entries Closed",
  winner_selected: "Winner Selected",
  completed: "Completed",
  cancelled: "Cancelled",
};

/**
 * @param {string | null | undefined} status
 */
export function formatGiveawayStatus(status) {
  return GIVEAWAY_STATUS_LABELS[status ?? ""] ?? status ?? "—";
}
