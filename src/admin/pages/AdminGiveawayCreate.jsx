import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import GiveawayForm from "../components/GiveawayForm";
import { useAdmin } from "../auth/useAdmin";
import {
  getEmptyGiveawayFormValues,
  listTournamentsForGiveawaySelector,
} from "../repositories/giveawayRepository";
import { adminGiveawayStyles } from "../styles/adminGiveawayStyles";
import { adminTournamentStyles } from "../styles/adminTournamentStyles";

export default function AdminGiveawayCreate() {
  useAdmin();
  const navigate = useNavigate();
  const [initialValues] = useState(() => getEmptyGiveawayFormValues());
  const [tournaments, setTournaments] = useState(/** @type {object[]} */ ([]));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(/** @type {string | null} */ (null));

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const list = await listTournamentsForGiveawaySelector();
        if (!active) return;
        setTournaments(list);
      } catch (err) {
        if (!active) return;
        setError(err?.message ?? "Failed to load tournaments.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

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
    <>
      <style>{adminGiveawayStyles}</style>
      <GiveawayForm
        mode="create"
        initialValues={initialValues}
        tournaments={tournaments}
        onCancel={() => navigate("/admin/giveaways")}
        onSuccess={(result) => {
          navigate(`/admin/giveaways/${result.id}/edit`, { replace: true });
        }}
      />
    </>
  );
}
