import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import AdminTournamentLifecyclePanel from "../components/AdminTournamentLifecyclePanel";
import TournamentForm from "../components/TournamentForm";
import { useAdmin } from "../auth/useAdmin";
import { useTournamentFormOptions } from "../hooks/useTournamentFormOptions";
import { getTournamentFormById } from "../repositories/tournamentRepository";
import { adminTournamentStyles } from "../styles/adminTournamentStyles";

/**
 * Edit tournament page — shared form + explicit lifecycle actions.
 */
export default function AdminTournamentEdit() {
  useAdmin();
  const { id } = useParams();
  const navigate = useNavigate();
  const { games, series, loading: optionsLoading, error: optionsError } =
    useTournamentFormOptions();

  const [record, setRecord] = useState(
    /** @type {{ values: object, meta: object } | null} */ (null)
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(/** @type {string | null} */ (null));
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(async () => {
    if (!id) {
      setError("Missing tournament id.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const next = await getTournamentFormById(id);
      if (!next) {
        setRecord(null);
        setError("Tournament not found.");
        return;
      }
      setRecord(next);
    } catch (err) {
      setRecord(null);
      setError(err?.message ?? "Failed to load tournament.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    reload();
  }, [reload, reloadKey]);

  if ((loading || optionsLoading) && !record) {
    return (
      <>
        <style>{adminTournamentStyles}</style>
        <div className="admin-inline-loading" role="status">
          Loading tournament…
        </div>
      </>
    );
  }

  if (error || optionsError) {
    return (
      <>
        <style>{adminTournamentStyles}</style>
        <div className="admin-inline-error" role="alert">
          <p style={{ margin: "0 0 0.75rem" }}>{error || optionsError}</p>
          <Link to="/admin/tournaments" className="admin-form-back">
            ← Back to tournaments
          </Link>
        </div>
      </>
    );
  }

  if (!record) return null;

  return (
    <>
      <style>{adminTournamentStyles}</style>

      <AdminTournamentLifecyclePanel
        tournamentId={id}
        meta={record.meta}
        onChanged={async () => {
          setReloadKey((value) => value + 1);
          await reload();
        }}
      />

      <TournamentForm
        mode="edit"
        tournamentId={id}
        initialValues={record.values}
        meta={record.meta}
        games={games}
        series={series}
        onCancel={() => navigate("/admin/tournaments")}
        onSuccess={async () => {
          setReloadKey((value) => value + 1);
          await reload();
        }}
      />
    </>
  );
}
