import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Tournaments from "./pages/Tournaments";
import Leaderboard from "./pages/Leaderboard";

export default function App() {
  return (
    <Routes>

      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/dashboard"
        element={<Dashboard />}
      />

      <Route
        path="/tournaments"
        element={<Tournaments />}
      />

      <Route
        path="/leaderboard"
        element={<Leaderboard />}
      />

    </Routes>
  );
}