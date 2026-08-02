import { cloneElement, isValidElement, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import GiveawayEligiblePreview from "./GiveawayEligiblePreview";
import GiveawayTournamentSelector from "./GiveawayTournamentSelector";
import { useAdmin } from "../auth/useAdmin";
import { createEmptyGiveawayFormValues } from "../lib/giveawayFormDefaults";
import {
  GiveawayValidationError,
  buildEligiblePlayersCsv,
  computeEligibility,
  createDraft,
  updateGiveaway,
} from "../repositories/giveawayRepository";
import { adminGiveawayStyles } from "../styles/adminGiveawayStyles";
import { adminTournamentStyles } from "../styles/adminTournamentStyles";

/**
 * Shared create/edit giveaway form.
 *
 * @param {object} props
 * @param {"create" | "edit"} props.mode
 * @param {string} [props.giveawayId]
 * @param {import("../lib/giveawayFormDefaults").GiveawayFormValues} [props.initialValues]
 * @param {object | null} [props.meta]
 * @param {{ id: string, label: string, game: string, status: string }[]} props.tournaments
 * @param {(result: { id: string, status: string }) => void} props.onSuccess
 * @param {() => void} [props.onCancel]
 * @param {() => void} [props.onValuesSaved]
 */
export default function GiveawayForm({
  mode,
  giveawayId,
  initialValues,
  meta = null,
  tournaments,
  onSuccess,
  onCancel,
  onValuesSaved,
}) {
  const { user } = useAdmin();
  const [values, setValues] = useState(
    () => initialValues ?? createEmptyGiveawayFormValues()
  );
  const [fieldErrors, setFieldErrors] = useState(/** @type {Record<string, string>} */ ({}));
  const [formError, setFormError] = useState(/** @type {string | null} */ (null));
  const [successMessage, setSuccessMessage] = useState(/** @type {string | null} */ (null));
  const [submitting, setSubmitting] = useState(false);
  const [eligibility, setEligibility] = useState(
    /** @type {{ players: object[], stats: object } | null} */ (null)
  );
  const [eligibilityLoading, setEligibilityLoading] = useState(false);

  useEffect(() => {
    if (initialValues) setValues(initialValues);
  }, [initialValues]);

  useEffect(() => {
    let active = true;
    const ids = values.eligibleTournamentIds ?? [];

    (async () => {
      if (ids.length === 0) {
        if (!active) return;
        setEligibility({
          players: [],
          stats: {
            selectedTournaments: 0,
            totalRegistrations: 0,
            duplicatePlayersRemoved: 0,
            uniqueEligiblePlayers: 0,
          },
        });
        return;
      }

      setEligibilityLoading(true);
      try {
        const result = await computeEligibility(ids);
        if (!active) return;
        setEligibility(result);
      } catch {
        if (!active) return;
        setEligibility(null);
      } finally {
        if (active) setEligibilityLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [values.eligibleTournamentIds]);

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

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setSuccessMessage(null);
    setFieldErrors({});

    try {
      const result =
        mode === "create"
          ? await createDraft(values, { userId: user?.id ?? null })
          : await updateGiveaway(giveawayId, values, {
              userId: user?.id ?? null,
            });

      setSuccessMessage(
        mode === "create" ? "Draft giveaway saved." : "Giveaway saved."
      );
      onSuccess(result);
      onValuesSaved?.();
    } catch (err) {
      if (err instanceof GiveawayValidationError) {
        setFieldErrors(err.fieldErrors ?? {});
        setFormError(err.message);
      } else {
        setFormError(err?.message ?? "Unable to save giveaway.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleExportCsv() {
    try {
      const csv = await buildEligiblePlayersCsv(values.eligibleTournamentIds);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `dgl-giveaway-eligible-${Date.now()}.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setFormError(err?.message ?? "CSV export failed.");
    }
  }

  const canEditFields =
    mode === "create" ||
    (meta &&
      !meta.isArchived &&
      meta.status !== "completed" &&
      meta.status !== "cancelled");

  return (
    <>
      <style>{adminTournamentStyles}</style>
      <style>{adminGiveawayStyles}</style>
      <form className="admin-form" onSubmit={handleSubmit} noValidate>
        <header className="admin-page-header">
          <p className="admin-page-eyebrow">
            <Link to="/admin/giveaways" className="admin-form-back">
              ← Giveaways
            </Link>
          </p>
          <h1 className="admin-page-title">
            {mode === "create" ? "Create Giveaway" : "Edit Giveaway"}
          </h1>
          <p className="admin-page-copy">
            Community rewards for players who supported DGL through official
            tournament registrations. Eligibility is calculated automatically.
          </p>
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
          <Field label="Giveaway Title" name="title" required error={fieldErrors.title}>
            <input
              className="admin-toolbar-input"
              value={values.title}
              onChange={(e) => updateField("title", e.target.value)}
              disabled={!canEditFields}
              required
              placeholder="🎉 DGL 150+ Members Celebration Giveaway"
            />
          </Field>

          <Field label="Prize" name="prize" required error={fieldErrors.prize}>
            <input
              className="admin-toolbar-input"
              value={values.prize}
              onChange={(e) => updateField("prize", e.target.value)}
              disabled={!canEditFields}
              required
              placeholder="₹1,000 Steam or PlayStation Gift Card"
            />
          </Field>

          <Field label="Reason" name="reason" error={fieldErrors.reason}>
            <input
              className="admin-toolbar-input"
              value={values.reason}
              onChange={(e) => updateField("reason", e.target.value)}
              disabled={!canEditFields}
              placeholder="Celebrate 150+ Discord members"
            />
          </Field>

          <Field
            label="Entries Close Date"
            name="entriesCloseAt"
            error={fieldErrors.entriesCloseAt}
          >
            <input
              className="admin-toolbar-input"
              type="datetime-local"
              value={values.entriesCloseAt}
              onChange={(e) => updateField("entriesCloseAt", e.target.value)}
              disabled={!canEditFields}
            />
          </Field>

          <Field label="Winner Draw Date" name="drawAt" error={fieldErrors.drawAt}>
            <input
              className="admin-toolbar-input"
              type="datetime-local"
              value={values.drawAt}
              onChange={(e) => updateField("drawAt", e.target.value)}
              disabled={!canEditFields}
            />
          </Field>
        </div>

        <div className="admin-form-field" style={{ marginBottom: "1rem" }}>
          <label className="admin-toolbar-label" htmlFor="giveaway-description">
            Description
          </label>
          <textarea
            id="giveaway-description"
            className="admin-toolbar-input"
            rows={3}
            value={values.description}
            onChange={(e) => updateField("description", e.target.value)}
            disabled={!canEditFields}
          />
        </div>

        <div className="admin-form-field" style={{ marginBottom: "1rem" }}>
          <label className="admin-toolbar-label" htmlFor="giveaway-rules">
            Rules
          </label>
          <textarea
            id="giveaway-rules"
            className="admin-toolbar-input"
            rows={4}
            value={values.rules}
            onChange={(e) => updateField("rules", e.target.value)}
            disabled={!canEditFields}
          />
        </div>

        <div style={{ pointerEvents: canEditFields ? "auto" : "none", opacity: canEditFields ? 1 : 0.65 }}>
          <GiveawayTournamentSelector
            tournaments={tournaments}
            selectedIds={values.eligibleTournamentIds}
            onChange={(ids) => updateField("eligibleTournamentIds", ids)}
            error={fieldErrors.eligibleTournamentIds}
          />
        </div>

        <div style={{ margin: "1.5rem 0" }}>
          <GiveawayEligiblePreview
            stats={eligibility?.stats ?? null}
            players={eligibility?.players ?? []}
            loading={eligibilityLoading}
            onExportCsv={handleExportCsv}
          />
        </div>

        {canEditFields ? (
          <div className="admin-form-actions">
            <button
              type="submit"
              className="admin-form-submit"
              disabled={submitting}
            >
              {submitting
                ? "Saving…"
                : mode === "create"
                  ? "Save Draft"
                  : "Save Changes"}
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
        ) : null}
      </form>
    </>
  );
}

function Field({ label, name, children, error, required }) {
  const controlId = `giveaway-${name}`;
  const control = isValidElement(children)
    ? cloneElement(children, {
        id: controlId,
        "aria-invalid": Boolean(error) || undefined,
      })
    : children;

  return (
    <div className={`admin-form-field${error ? " has-error" : ""}`}>
      <label className="admin-toolbar-label" htmlFor={controlId}>
        {label}
        {required ? " *" : ""}
      </label>
      {control}
      {error ? (
        <p className="admin-form-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
