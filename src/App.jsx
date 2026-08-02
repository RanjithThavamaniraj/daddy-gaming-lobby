import { Routes, Route } from "react-router-dom";

import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Tournaments from "./pages/Tournaments";
import TournamentResults from "./pages/TournamentResults";
import Leaderboard from "./pages/Leaderboard";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import AdminAuthLayout from "./admin/AdminAuthLayout";
import AdminGuard from "./admin/auth/AdminGuard";
import AdminShell from "./admin/layout/AdminShell";
import AdminLogin from "./admin/pages/AdminLogin";
import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminTournaments from "./admin/pages/AdminTournaments";
import AdminTournamentCreate from "./admin/pages/AdminTournamentCreate";
import AdminTournamentEdit from "./admin/pages/AdminTournamentEdit";
import AdminResults from "./admin/pages/AdminResults";
import AdminLeaderboardPage from "./admin/pages/AdminLeaderboardPage";
import AdminHallOfFame from "./admin/pages/AdminHallOfFame";
import AdminGiveaways from "./admin/pages/AdminGiveaways";
import AdminSettings from "./admin/pages/AdminSettings";

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tournaments" element={<Tournaments />} />
        <Route path="/tournaments/:slug" element={<TournamentResults />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />

        <Route path="/admin" element={<AdminAuthLayout />}>
          <Route path="login" element={<AdminLogin />} />
          <Route element={<AdminGuard />}>
            <Route element={<AdminShell />}>
              <Route index element={<AdminDashboard />} />
              <Route path="tournaments" element={<AdminTournaments />} />
              <Route path="tournaments/new" element={<AdminTournamentCreate />} />
              <Route path="tournaments/:id/edit" element={<AdminTournamentEdit />} />
              <Route path="results" element={<AdminResults />} />
              <Route path="leaderboard" element={<AdminLeaderboardPage />} />
              <Route path="hall-of-fame" element={<AdminHallOfFame />} />
              <Route path="giveaways" element={<AdminGiveaways />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
