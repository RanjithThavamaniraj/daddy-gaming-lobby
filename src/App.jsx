import { BrowserRouter, Routes, Route, Link } from "react-router-dom"

import Home from "./pages/Home"
import Tournaments from "./pages/Tournaments"
import Community from "./pages/Community"
import Login from "./pages/Login"

export default function App() {
  return (
    <BrowserRouter>
      <div className="bg-black text-white">

        {/* Navbar */}
        <nav className="flex items-center justify-between px-8 py-6 border-b border-zinc-800">

          <h1 className="text-3xl font-black">
            Daddy Gaming Lobby
          </h1>

          <div className="flex gap-6 text-lg">
            <Link to="/">Home</Link>
            <Link to="/tournaments">Tournaments</Link>
            <Link to="/community">Community</Link>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/community" element={<Community />} />
          <Route path="/login" element={<Login />} />
        </Routes>

      </div>
    </BrowserRouter>
  )
}