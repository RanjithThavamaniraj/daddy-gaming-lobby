import { cloneElement, isValidElement, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useAdmin } from "../auth/useAdmin";
import { createEmptyTournamentFormValues } from "../lib/tournamentFormDefaults";
import {
  TournamentValidationError,
  createTournamentDraft,
  updateTournamentDraft,
} from "../repositories/tournamentRepository";
import { adminTournamentStyles } from "../styles/adminTournamentStyles";

/**
 * Shared create/edit form. Pages must not call Supabase — this form uses the repository.
 *
 * @param {object} props
 * @param {"create" | "edit"} props.mode
 * @param {string} [props.tournamentId]
 * @param {import("../lib/tournamentFormDefaults").TournamentFormValues} [props.initialValues]
 * @param {{ globalNumber?: number, tournamentNumber?: string, status?: string } | null} [props.meta]
 * @param {{ id: string, name: string, slug: string, accentColor: string, defaultParticipationMode: string }[]} props.games
 * @param {{ id: string, name: string, gameId: string, eventType: string }[]} props.series
 * @param {(result: { id: string, globalNumber: number, status: string }) => void} props.onSuccess
 * @param {() => void} [props.onCancel]
 */
export default function TournamentForm({
  mode,
  tournamentId,
  initialValues,
  meta = null,
  games,
  series,
  onSuccess,
  onCancel,
}) {
  const { user } = useAdmin();
  const [values, setValues] = useState(
    () => initialValues ?? createEmptyTournamentFormValues()
  );
  const [fieldErrors, setFieldErrors] = useState(/** @type {Record<string, string>} */ ({}));
  const [formError, setFormError] = useState(/** @type {string | null} */ (null));
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(/** @type {string | null} */ (null));

  useEffect(() => {
    if (initialValues) {
      setValues(initialValues);
    }
  }, [initialValues]);

  const filteredSeries = useMemo(() => {
    if (!values.gameId) return series;
    return series.filter((item) => item.gameId === values.gameId);
  }, [series, values.gameId]);

  const isDraft = mode === "create" || meta?.status === "draft";
  const submitLabel = isDraft ? "Save Draft" : "Save Changes";

  function updateField(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
    setFormError(null);
    setSuccessMessage(null);
  }

  function handleGameChange(gameId) {
    const game = games.find((item) => item.id === gameId);
    setValues((prev) => ({
      ...prev,
      gameId,
      seriesId:
        prev.seriesId &&
        series.some((item) => item.id === prev.seriesId && item.gameId === gameId)
          ? prev.seriesId
          : "",
      participationMode: game?.defaultParticipationMode === "solo" ? "solo" : "team",
      accentColor: prev.accentColor || game?.accentColor || "",
    }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.gameId;
      delete next.seriesId;
      return next;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setSuccessMessage(null);
    setFieldErrors({});

    try {
      const result =
        mode === "create"
          ? await createTournamentDraft(values, { userId: user?.id ?? null })
          : await updateTournamentDraft(tournamentId, values, {
              userId: user?.id ?? null,
            });

      setSuccessMessage(
        mode === "create"
          ? `Draft saved as Tournament #${result.globalNumber}.`
          : `Tournament #${result.globalNumber} saved.`
      );
      onSuccess(result);
    } catch (err) {
      if (err instanceof TournamentValidationError) {
        setFieldErrors(err.fieldErrors ?? {});
        setFormError(err.message);
      } else {
        setFormError(err?.message ?? "Unable to save tournament.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <style>{adminTournamentStyles}</style>
      <form className="admin-form" onSubmit={handleSubmit} noValidate>
        <header className="admin-page-header">
          <p className="admin-page-eyebrow">
            <Link to="/admin/tournaments" className="admin-form-back">
              ← Tournaments
            </Link>
          </p>
          <h1 className="admin-page-title">
            {mode === "create" ? "Create Tournament" : "Edit Tournament"}
          </h1>
          <p className="admin-page-copy">
            {mode === "create"
              ? "Create a draft tournament. Use lifecycle actions after saving to publish and progress the event."
              : "Update tournament details below. Use the Lifecycle panel above for publish, registration, feature, archive, cancel, and duplicate."}
          </p>
          {meta?.tournamentNumber ? (
            <p className="admin-form-meta">
              {meta.tournamentNumber}
              {meta.status ? ` · ${meta.status}` : ""}
            </p>
          ) : null}
        </header>

        {formError ? (
          <div className="admin-inline-error" role="alert">
            {formError}
          </div>
        ) : null}

        {successMessage ? (
          <div className="admin-inline-success" role="status">
            {successMessage}
          </div>
        ) : null}

        <div className="admin-form-grid">
          <Field
            label="Championship Label"
            name="championshipLabel"
            required
            error={fieldErrors.championshipLabel}
            hint="Shown in titles, e.g. Valorant or FC 26"
          >
            <input
              className="admin-toolbar-input"
              value={values.championshipLabel}
              onChange={(e) => updateField("championshipLabel", e.target.value)}
              required
            />
          </Field>

          <Field
            label="Game"
            name="gameId"
            required
            error={fieldErrors.gameId}
          >
            <select
              className="admin-toolbar-select"
              value={values.gameId}
              onChange={(e) => handleGameChange(e.target.value)}
              required
            >
              <option value="">Select a game…</option>
              {games.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.name}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Tournament Series"
            name="seriesId"
            error={fieldErrors.seriesId}
            hint="Controls branding: Tournament (Championship) or Saturday Showdown"
          >
            <select
              className="admin-toolbar-select"
              value={values.seriesId}
              onChange={(e) => updateField("seriesId", e.target.value)}
              disabled={!values.gameId}
            >
              <option value="">No series</option>
              {filteredSeries.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                  {item.eventType === "saturday_showdown"
                    ? " · Saturday Showdown"
                    : " · Tournament"}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Participation"
            name="participationMode"
            error={fieldErrors.participationMode}
          >
            <select
              className="admin-toolbar-select"
              value={values.participationMode}
              onChange={(e) => updateField("participationMode", e.target.value)}
            >
              <option value="team">Team</option>
              <option value="solo">Solo</option>
            </select>
          </Field>

          <Field
            label="External ID"
            name="externalId"
            required
            error={fieldErrors.externalId}
            hint="Stable app id, e.g. dgl-valorant-championship-1"
          >
            <input
              className="admin-toolbar-input"
              value={values.externalId}
              onChange={(e) => updateField("externalId", e.target.value)}
              required
              autoComplete="off"
            />
          </Field>

          <Field
            label="Slug"
            name="slug"
            required
            error={fieldErrors.slug}
            hint="URL slug, e.g. valorant-1"
          >
            <input
              className="admin-toolbar-input"
              value={values.slug}
              onChange={(e) => updateField("slug", e.target.value)}
              required
              autoComplete="off"
            />
          </Field>

          <Field label="Format" name="format" error={fieldErrors.format}>
            <input
              className="admin-toolbar-input"
              value={values.format}
              onChange={(e) => updateField("format", e.target.value)}
              placeholder="e.g. 5v5"
            />
          </Field>

          <Field label="Match Type" name="matchType" error={fieldErrors.matchType}>
            <input
              className="admin-toolbar-input"
              value={values.matchType}
              onChange={(e) => updateField("matchType", e.target.value)}
              placeholder="e.g. Knockout"
            />
          </Field>

          <Field
            label="Prize Pool Display"
            name="prizePoolDisplay"
            error={fieldErrors.prizePoolDisplay}
          >
            <input
              className="admin-toolbar-input"
              value={values.prizePoolDisplay}
              onChange={(e) => updateField("prizePoolDisplay", e.target.value)}
              placeholder="e.g. ₹2,000 Team Prize"
            />
          </Field>

          <Field
            label="Prize Pool Amount (INR)"
            name="prizePoolAmount"
            error={fieldErrors.prizePoolAmount}
          >
            <input
              className="admin-toolbar-input"
              type="number"
              min="0"
              step="1"
              value={values.prizePoolAmount}
              onChange={(e) => updateField("prizePoolAmount", e.target.value)}
            />
          </Field>

          <Field
            label="Entry Fee"
            name="entryFee"
            error={fieldErrors.entryFee}
            hint="Stored in metadata"
          >
            <input
              className="admin-toolbar-input"
              value={values.entryFee}
              onChange={(e) => updateField("entryFee", e.target.value)}
              placeholder="e.g. ₹50 Per Player"
            />
          </Field>

          <Field
            label="Accent Color"
            name="accentColor"
            error={fieldErrors.accentColor}
          >
            <input
              className="admin-toolbar-input"
              value={values.accentColor}
              onChange={(e) => updateField("accentColor", e.target.value)}
              placeholder="#a855f7"
            />
          </Field>

          <Field
            label="Maximum Players"
            name="registrationLimit"
            error={fieldErrors.registrationLimit}
            hint="Main confirmed roster capacity"
          >
            <input
              className="admin-toolbar-input"
              type="number"
              min="1"
              step="1"
              value={values.registrationLimit}
              onChange={(e) => updateField("registrationLimit", e.target.value)}
              placeholder="e.g. 16"
            />
          </Field>

          <Field
            label="Reserve Players"
            name="reserveLimit"
            error={fieldErrors.reserveLimit}
            hint="Reserve list capacity (default 4)"
          >
            <input
              className="admin-toolbar-input"
              type="number"
              min="0"
              step="1"
              value={values.reserveLimit}
              onChange={(e) => updateField("reserveLimit", e.target.value)}
              placeholder="e.g. 4"
            />
          </Field>

          <Field
            label="Registration Opens"
            name="registrationOpensAt"
            error={fieldErrors.registrationOpensAt}
          >
            <input
              className="admin-toolbar-input"
              type="datetime-local"
              value={values.registrationOpensAt}
              onChange={(e) => updateField("registrationOpensAt", e.target.value)}
            />
          </Field>

          <Field
            label="Registration Closes"
            name="registrationClosesAt"
            error={fieldErrors.registrationClosesAt}
          >
            <input
              className="admin-toolbar-input"
              type="datetime-local"
              value={values.registrationClosesAt}
              onChange={(e) => updateField("registrationClosesAt", e.target.value)}
            />
          </Field>

          <Field
            label="Tournament Start"
            name="startsAt"
            error={fieldErrors.startsAt}
          >
            <input
              className="admin-toolbar-input"
              type="datetime-local"
              value={values.startsAt}
              onChange={(e) => updateField("startsAt", e.target.value)}
            />
          </Field>
        </div>

        <div className="admin-form-actions">
          <button
            type="submit"
            className="admin-form-submit"
            disabled={submitting}
          >
            {submitting ? "Saving…" : submitLabel}
          </button>
          {onCancel ? (
            <button
              type="button"
              className="admin-pagination-btn"
              onClick={onCancel}
              disabled={submitting}
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>
    </>
  );
}

/**
 * @param {object} props
 * @param {string} props.label
 * @param {string} props.name
 * @param {import("react").ReactNode} props.children
 * @param {string} [props.error]
 * @param {string} [props.hint]
 * @param {boolean} [props.required]
 */
function Field({ label, name, children, error, hint, required }) {
  const controlId = `tournament-${name}`;
  const control = isValidElement(children)
    ? cloneElement(children, {
        id: controlId,
        "aria-invalid": Boolean(error) || undefined,
        "aria-describedby": error
          ? `${controlId}-error`
          : hint
            ? `${controlId}-hint`
            : undefined,
      })
    : children;

  return (
    <div className={`admin-form-field${error ? " has-error" : ""}`}>
      <label className="admin-toolbar-label" htmlFor={controlId}>
        {label}
        {required ? " *" : ""}
      </label>
      <div className="admin-form-control">{control}</div>
      {hint && !error ? (
        <p className="admin-form-hint" id={`${controlId}-hint`}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="admin-form-error" id={`${controlId}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
