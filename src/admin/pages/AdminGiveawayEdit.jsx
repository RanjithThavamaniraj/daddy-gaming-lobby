import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import AdminGiveawayLifecyclePanel from "../components/AdminGiveawayLifecyclePanel";
import GiveawayForm from "../components/GiveawayForm";
import { useAdmin } from "../auth/useAdmin";
import {
  computeEligibility,
  getGiveawayFormById,
  listTournamentsForGiveawaySelector,
} from "../repositories/giveawayRepository";
import { adminGiveawayStyles } from "../styles/adminGiveawayStyles";
import { adminTournamentStyles } from "../styles/adminTournamentStyles";

export default function AdminGiveawayEdit() {
  useAdmin();
  const { id } = useParams();
  const navigate = useNavigate();

  const [record, setRecord] = useState(/** @type {{ values: object, meta: object } | null} */ (null));
  const [tournaments, setTournaments] = useState(/** @type {object[]} */ ([]));
  const [eligiblePlayers, setEligiblePlayers] = useState(/** @type {object[]} */ ([]));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(/** @type {string | null} */ (null));

  const reload = useCallback(async () => {
    if (!id) {
      setError("Missing giveaway id.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [next, tournamentOptions] = await Promise.all([
        getGiveawayFormById(id),
        listTournamentsForGiveawaySelector(),
      ]);
      if (!next) {
        setRecord(null);
        setError("Giveaway not found.");
        return;
      }
      setRecord(next);
      setTournaments(tournamentOptions);

      const eligibility = await computeEligibility(
        next.values.eligibleTournamentIds ?? []
      );
      setEligiblePlayers(eligibility.players);
    } catch (err) {
      setRecord(null);
      setError(err?.message ?? "Failed to load giveaway.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    reload();
  }, [reload]);

  if (loading && !record) {
    return (
      <>
        <style>{adminTournamentStyles}</style>
        <div className="admin-inline-loading" role="status">
          Loading giveaway…
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <style>{adminTournamentStyles}</style>
        <div className="admin-inline-error" role="alert">
          <p style={{ margin: "0 0 0.75rem" }}>{error}</p>
          <Link to="/admin/giveaways" className="admin-form-back">
            ← Back to giveaways
          </Link>
        </div>
      </>
    );
  }

  if (!record) return null;

  return (
    <>
      <style>{adminGiveawayStyles}</style>
      <AdminGiveawayLifecyclePanel
        giveawayId={id}
        meta={record.meta}
        eligiblePlayers={eligiblePlayers}
        onChanged={reload}
      />
      <GiveawayForm
        mode="edit"
        giveawayId={id}
        initialValues={record.values}
        meta={record.meta}
        tournaments={tournaments}
        onCancel={() => navigate("/admin/giveaways")}
        onSuccess={async () => {
          await reload();
        }}
        onValuesSaved={reload}
      />
    </>
  );
}
