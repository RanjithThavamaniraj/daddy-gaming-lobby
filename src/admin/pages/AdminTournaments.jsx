import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import AdminTournamentTable from "../components/AdminTournamentTable";
import AdminTournamentToolbar from "../components/AdminTournamentToolbar";
import { useAdmin } from "../auth/useAdmin";
import { useAdminTournamentData } from "../hooks/useAdminTournamentData";
import {
  ADMIN_TOURNAMENT_PAGE_SIZE,
  processAdminTournamentList,
} from "../lib/adminTournamentList";
import { adminTournamentStyles } from "../styles/adminTournamentStyles";

/**
 * Tournament management list with create/edit entry points (Phase 4B).
 */
export default function AdminTournaments() {
  useAdmin();

  const { tournaments, loading, error, reload } = useAdminTournamentData();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("global_number_desc");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [search, status, sort]);

  const processed = useMemo(
    () =>
      processAdminTournamentList(tournaments, {
        search,
        status,
        sort,
        page,
        pageSize: ADMIN_TOURNAMENT_PAGE_SIZE,
      }),
    [tournaments, search, status, sort, page]
  );

  useEffect(() => {
    if (page !== processed.page) {
      setPage(processed.page);
    }
  }, [page, processed.page]);

  return (
    <>
      <style>{adminTournamentStyles}</style>
      <section>
        <header className="admin-page-header admin-page-header-row">
          <div>
            <p className="admin-page-eyebrow">Management</p>
            <h1 className="admin-page-title">Tournaments</h1>
            <p className="admin-page-copy">
              Browse and edit tournaments. Create saves as a draft — publish and
              lifecycle actions arrive later.
            </p>
          </div>
          <Link className="admin-form-submit admin-header-cta" to="/admin/tournaments/new">
            Create Tournament
          </Link>
        </header>

        {error ? (
          <div className="admin-inline-error" role="alert">
            <p style={{ margin: "0 0 0.75rem" }}>{error}</p>
            <button type="button" className="admin-pagination-btn" onClick={reload}>
              Retry
            </button>
          </div>
        ) : null}

        {!error && loading ? (
          <div className="admin-inline-loading" role="status">
            Loading tournaments…
          </div>
        ) : null}

        {!error && !loading ? (
          <>
            <AdminTournamentToolbar
              search={search}
              onSearchChange={setSearch}
              status={status}
              onStatusChange={setStatus}
              sort={sort}
              onSortChange={setSort}
            />
            <AdminTournamentTable
              rows={processed.rows}
              total={processed.total}
              page={processed.page}
              totalPages={processed.totalPages}
              onPageChange={setPage}
            />
          </>
        ) : null}
      </section>
    </>
  );
}
