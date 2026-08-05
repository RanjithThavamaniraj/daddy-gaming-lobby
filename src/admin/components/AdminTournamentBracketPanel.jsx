import { useCallback, useEffect, useState } from "react";

import {
  loadAdminBracket,
  recordFixtureResult,
  runGroupDraw,
  setFixtureSchedule,
  setFixtureStatus,
} from "../repositories/fixtureRepository";
import { fixtureStatusLabel } from "../../lib/supabase/tournamentBracket";

/**
 * Admin panel: group draw + match results + bracket progression.
 *
 * @param {object} props
 * @param {string} props.tournamentId
 * @param {string} [props.tournamentStatus]
 * @param {() => void | Promise<void>} [props.onChanged]
 */
export default function AdminTournamentBracketPanel({
  tournamentId,
  tournamentStatus,
  onChanged,
}) {
  const [bracket, setBracket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(/** @type {string | null} */ (null));
  const [message, setMessage] = useState(/** @type {string | null} */ (null));
  const [drafts, setDrafts] = useState(
    /** @type {Record<string, { winnerId: string, p1: string, p2: string, schedule: string }>} */ ({})
  );

  useEffect(() => {
    let cancelled = false;
    loadAdminBracket(tournamentId)
      .then((data) => {
        if (cancelled) return;
        setBracket(data);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message ?? "Failed to load bracket");
        setBracket(null);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tournamentId]);

  const reload = useCallback(async () => {
    if (!tournamentId) return;
    setError(null);
    try {
      const data = await loadAdminBracket(tournamentId);
      setBracket(data);
    } catch (err) {
      setError(err?.message ?? "Failed to load bracket");
      setBracket(null);
    }
  }, [tournamentId]);
  function updateDraft(fixtureId, patch) {
    setDrafts((prev) => ({
      ...prev,
      [fixtureId]: {
        winnerId: prev[fixtureId]?.winnerId ?? "",
        p1: prev[fixtureId]?.p1 ?? "",
        p2: prev[fixtureId]?.p2 ?? "",
        schedule: prev[fixtureId]?.schedule ?? "",
        ...patch,
      },
    }));
  }

  async function handleDraw() {
    if (
      !window.confirm(
        "Run the group draw? This creates groups and fixtures and cannot be undone from the UI."
      )
    ) {
      return;
    }
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const count = await runGroupDraw(tournamentId);
      setMessage(`Group draw complete — ${count} fixtures created.`);
      await reload();
      await onChanged?.();
    } catch (err) {
      setError(err?.message ?? "Group draw failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleSetLive(fixtureId) {
    setBusy(true);
    setError(null);
    try {
      await setFixtureStatus(fixtureId, "live");
      setMessage("Match marked live.");
      await reload();
    } catch (err) {
      setError(err?.message ?? "Failed to set live");
    } finally {
      setBusy(false);
    }
  }

  async function handleSchedule(fixtureId) {
    const draft = drafts[fixtureId];
    if (!draft?.schedule) {
      setError("Pick a scheduled time first.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const iso = new Date(draft.schedule).toISOString();
      await setFixtureSchedule(fixtureId, iso);
      setMessage("Match schedule updated.");
      await reload();
    } catch (err) {
      setError(err?.message ?? "Failed to schedule match");
    } finally {
      setBusy(false);
    }
  }

  async function handleRecord(fixture) {
    const draft = drafts[fixture.id] ?? {};
    const winnerId = draft.winnerId || fixture.winner?.id;
    if (!winnerId) {
      setError("Select a winner before saving the result.");
      return;
    }
    const p1 =
      draft.p1 === "" || draft.p1 == null ? null : Number(draft.p1);
    const p2 =
      draft.p2 === "" || draft.p2 == null ? null : Number(draft.p2);

    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await recordFixtureResult({
        fixtureId: fixture.id,
        winnerId,
        player1Score: Number.isFinite(p1) ? p1 : null,
        player2Score: Number.isFinite(p2) ? p2 : null,
      });
      setMessage(
        "Result saved. Bracket, standings, and points update automatically."
      );
      await reload();
      await onChanged?.();
    } catch (err) {
      setError(err?.message ?? "Failed to record result");
    } finally {
      setBusy(false);
    }
  }

  const canDraw =
    !bracket?.hasGroups &&
    (tournamentStatus === "registration_closed" ||
      tournamentStatus === "active");

  const fixtures = bracket?.fixtures ?? [];

  return (
    <section className="admin-bracket-panel">
      <div className="admin-bracket-header">
        <div>
          <h2 className="admin-panel-title">Bracket &amp; Match Results</h2>
          <p className="admin-panel-desc">
            Run the group draw, mark matches live, enter scores, and advance the
            bracket — without editing database rows.
          </p>
        </div>
        {canDraw ? (
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            disabled={busy || loading}
            onClick={handleDraw}
          >
            Run Group Draw
          </button>
        ) : null}
      </div>

      {error ? (
        <div className="admin-inline-error" role="alert">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="admin-inline-success" role="status">
          {message}
        </div>
      ) : null}

      {loading ? (
        <p className="admin-muted">Loading bracket…</p>
      ) : !bracket?.hasGroups ? (
        <p className="admin-muted">
          No groups yet. Close registrations (16 confirmed players), then run
          the group draw.
        </p>
      ) : (
        <>
          <div className="admin-groups-summary">
            {(bracket.groups ?? []).map((g) => (
              <div key={g.id} className="admin-group-chip">
                <strong>Group {g.label}</strong>
                <span>
                  {(g.members ?? [])
                    .map((m) => m.player?.name || "TBD")
                    .join(", ")}
                </span>
              </div>
            ))}
          </div>

          <div className="admin-fixture-list">
            {fixtures.map((fixture) => {
              const draft = drafts[fixture.id] ?? {
                winnerId: fixture.winner?.id ?? "",
                p1:
                  fixture.player1Score != null
                    ? String(fixture.player1Score)
                    : "",
                p2:
                  fixture.player2Score != null
                    ? String(fixture.player2Score)
                    : "",
                schedule: fixture.scheduledAt
                  ? toLocalInput(fixture.scheduledAt)
                  : "",
              };
              const ready =
                Boolean(fixture.player1?.id) && Boolean(fixture.player2?.id);
              const done = fixture.status === "completed";

              return (
                <article key={fixture.id} className="admin-fixture-card">
                  <div className="admin-fixture-top">
                    <div>
                      <strong>{fixture.roundLabel}</strong>
                      <span className="admin-muted">
                        {" "}
                        · {fixtureStatusLabel(fixture.status)}
                      </span>
                    </div>
                    <div className="admin-fixture-players">
                      {fixture.player1?.name ||
                        fixture.player1Placeholder ||
                        "TBD"}{" "}
                      vs{" "}
                      {fixture.player2?.name ||
                        fixture.player2Placeholder ||
                        "TBD"}
                    </div>
                  </div>

                  <div className="admin-fixture-controls">
                    <label>
                      Schedule
                      <input
                        type="datetime-local"
                        value={draft.schedule}
                        disabled={busy || done}
                        onChange={(e) =>
                          updateDraft(fixture.id, {
                            schedule: e.target.value,
                          })
                        }
                      />
                    </label>
                    <button
                      type="button"
                      className="admin-btn"
                      disabled={busy || done || !draft.schedule}
                      onClick={() => handleSchedule(fixture.id)}
                    >
                      Save time
                    </button>
                    <button
                      type="button"
                      className="admin-btn"
                      disabled={busy || done || !ready || fixture.status === "live"}
                      onClick={() => handleSetLive(fixture.id)}
                    >
                      Mark live
                    </button>
                  </div>

                  <div className="admin-fixture-controls">
                    <label>
                      Winner
                      <select
                        value={draft.winnerId}
                        disabled={busy || done || !ready}
                        onChange={(e) =>
                          updateDraft(fixture.id, {
                            winnerId: e.target.value,
                          })
                        }
                      >
                        <option value="">Select winner</option>
                        {fixture.player1?.id ? (
                          <option value={fixture.player1.id}>
                            {fixture.player1.name}
                          </option>
                        ) : null}
                        {fixture.player2?.id ? (
                          <option value={fixture.player2.id}>
                            {fixture.player2.name}
                          </option>
                        ) : null}
                      </select>
                    </label>
                    <label>
                      Score P1
                      <input
                        type="number"
                        min="0"
                        value={draft.p1}
                        disabled={busy || done || !ready}
                        onChange={(e) =>
                          updateDraft(fixture.id, { p1: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      Score P2
                      <input
                        type="number"
                        min="0"
                        value={draft.p2}
                        disabled={busy || done || !ready}
                        onChange={(e) =>
                          updateDraft(fixture.id, { p2: e.target.value })
                        }
                      />
                    </label>
                    <button
                      type="button"
                      className="admin-btn admin-btn-primary"
                      disabled={busy || done || !ready}
                      onClick={() => handleRecord(fixture)}
                    >
                      {done ? "Completed" : "Save result"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}

/** @param {string} iso */
function toLocalInput(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
