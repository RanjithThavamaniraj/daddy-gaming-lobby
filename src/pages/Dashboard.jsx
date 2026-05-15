import { useEffect, useState } from "react"
import { supabase } from "../supabase"
import { Trophy, Flame, Shield } from "lucide-react"

export default function Dashboard() {

  const [user, setUser] = useState(null)
  const [registrations, setRegistrations] = useState([])

  useEffect(() => {
    async function loadData() {

      const {
        data: { user },
      } = await supabase.auth.getUser()

      setUser(user)

      if (user) {

        const { data } = await supabase
          .from("registrations")
          .select("*")
          .eq("email", user.email)

        setRegistrations(data || [])
      }
    }

    loadData()
  }, [])

  async function logout() {
    await supabase.auth.signOut()
    alert("Logged out!")
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 relative overflow-hidden">

      {/* Glow */}
      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-purple-600 opacity-20 blur-3xl rounded-full"></div>

      <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-blue-600 opacity-20 blur-3xl rounded-full"></div>

      <div className="relative z-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">

          <div>
            <h1 className="text-6xl font-black">
              GAMER DASHBOARD
            </h1>

            <p className="text-zinc-400 mt-4">
              {user?.email || "Guest User"}
            </p>
          </div>

          <button
            onClick={logout}
            className="mt-6 md:mt-0 bg-white text-black px-6 py-3 rounded-2xl font-bold hover:scale-105 transition"
          >
            Logout
          </button>

        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-8 backdrop-blur-lg">
            <Trophy size={40} className="text-yellow-400 mb-6" />

            <h2 className="text-zinc-400">
              Registered Tournaments
            </h2>

            <p className="text-5xl font-black mt-4">
              {registrations.length}
            </p>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-8 backdrop-blur-lg">
            <Flame size={40} className="text-red-400 mb-6" />

            <h2 className="text-zinc-400">
              Win Streak
            </h2>

            <p className="text-5xl font-black mt-4">
              4
            </p>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-8 backdrop-blur-lg">
            <Shield size={40} className="text-blue-400 mb-6" />

            <h2 className="text-zinc-400">
              Community Rank
            </h2>

            <p className="text-5xl font-black mt-4">
              #27
            </p>
          </div>

        </div>

        {/* Registered Tournaments */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-8 backdrop-blur-lg">

          <h2 className="text-4xl font-black mb-8">
            MY TOURNAMENTS
          </h2>

          <div className="space-y-4">

            {registrations.length === 0 ? (
              <div className="bg-zinc-800 p-5 rounded-2xl">
                No tournaments registered yet.
              </div>
            ) : (
              registrations.map((item, index) => (
                <div
                  key={index}
                  className="bg-zinc-800 p-5 rounded-2xl flex items-center justify-between"
                >
                  <span className="font-bold text-lg">
                    {item.tournament}
                  </span>

                  <span className="text-green-400">
                    Registered
                  </span>
                </div>
              ))
            )}

          </div>

        </div>

      </div>

    </div>
  )
}