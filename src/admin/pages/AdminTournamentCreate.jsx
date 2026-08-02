import { useState } from "react";
import { useNavigate } from "react-router-dom";

import TournamentForm from "../components/TournamentForm";
import { useAdmin } from "../auth/useAdmin";
import { useTournamentFormOptions } from "../hooks/useTournamentFormOptions";
import { getEmptyTournamentFormValues } from "../repositories/tournamentRepository";
import { adminTournamentStyles } from "../styles/adminTournamentStyles";

/**
 * Create tournament page — thin wrapper around shared TournamentForm.
 */
export default function AdminTournamentCreate() {
  useAdmin();
  const navigate = useNavigate();
  const { games, series, loading, error } = useTournamentFormOptions();
  const [initialValues] = useState(() => getEmptyTournamentFormValues());

  if (loading) {
    return (
      <>
        <style>{adminTournamentStyles}</style>
        <div className="admin-inline-loading" role="status">
          Loading form…
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <style>{adminTournamentStyles}</style>
        <div className="admin-inline-error" role="alert">
          {error}
        </div>
      </>
    );
  }

  return (
    <TournamentForm
      mode="create"
      initialValues={initialValues}
      games={games}
      series={series}
      onCancel={() => navigate("/admin/tournaments")}
      onSuccess={(result) => {
        navigate(`/admin/tournaments/${result.id}/edit`, { replace: true });
      }}
    />
  );
}
