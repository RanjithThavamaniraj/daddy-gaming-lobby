import { BrowserRouter, Routes, Route, Link } from "react-router-dom"

import Home from "./pages/Home"
import Dashboard from "./pages/Dashboard"
import Login from "./pages/Login"
import Tournaments from "./pages/Tournaments"

export default function App() {
  return (
    <BrowserRouter>

      <div className="min-h-screen bg-black text-white">

        {/* Navbar */}
        <nav className="flex items-center justify-between px-8 py-6 border-b border-zinc-800">

          <Link
            to="/"
            className="text-3xl font-black"
          >
            Daddy Gaming Lobby
          </Link>

          <div className="flex items-center gap-6">

            <Link to="/">
              Home
            </Link>

            <Link to="/dashboard">
              Dashboard
            </Link>

            <Link to="/tournaments">
              Tournaments
            </Link>

            <Link to="/login">
              Login
            </Link>

            <a
              href="https://discord.gg/gf7Ecat6Ka"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-indigo-600 px-4 py-2 rounded-xl font-bold hover:bg-indigo-500 transition"
            >
              Join Discord
            </a>

          </div>

        </nav>

        {/* Routes */}
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
            path="/login"
            element={<Login />}
          />

        </Routes>

      </div>

    </BrowserRouter>
  )
}