import { useAdmin } from "../auth/useAdmin";

/**
 * Top bar with page context, signed-in user, and logout.
 * @param {object} props
 * @param {string} [props.title]
 */
export default function AdminTopBar({ title = "Administration" }) {
  const { user, signOut } = useAdmin();

  return (
    <header className="admin-topbar">
      <h2 className="admin-topbar-heading">{title}</h2>

      <div className="admin-topbar-user">
        <div className="admin-topbar-meta">
          <span className="admin-topbar-label">Signed in</span>
          <span className="admin-topbar-email" title={user?.email ?? user?.id}>
            {user?.email ?? user?.id ?? "Admin"}
          </span>
        </div>
        <button
          type="button"
          className="admin-topbar-logout"
          onClick={() => signOut()}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
