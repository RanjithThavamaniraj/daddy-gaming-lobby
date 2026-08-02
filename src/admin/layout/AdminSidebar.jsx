import { NavLink } from "react-router-dom";

export const ADMIN_NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/tournaments", label: "Tournaments" },
  { to: "/admin/results", label: "Results" },
  { to: "/admin/leaderboard", label: "Leaderboard" },
  { to: "/admin/hall-of-fame", label: "Hall of Fame" },
  { to: "/admin/giveaways", label: "Giveaways" },
  { to: "/admin/settings", label: "Settings" },
];

/**
 * Left navigation for the admin shell.
 */
export default function AdminSidebar() {
  return (
    <aside className="admin-sidebar" aria-label="Admin navigation">
      <div className="admin-sidebar-brand">
        <p className="admin-sidebar-eyebrow">Daddy Gaming Lobby</p>
        <h1 className="admin-sidebar-title">Admin</h1>
      </div>

      <nav className="admin-nav">
        {ADMIN_NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `admin-nav-link${isActive ? " is-active" : ""}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
