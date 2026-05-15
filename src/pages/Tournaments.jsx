import { useEffect, useState } from "react"
import { supabase } from "../supabase"
import { Trophy, Flame, Swords } from "lucide-react"
import { motion } from "framer-motion"

export default function Tournaments() {

  const [user, setUser] = useState(null)

  useEffect(() => {
    async function getUser() {

      const {
        data: { user },
      } = await supabase.auth.getUser()

      setUser(user)
    }

    getUser()
  }, [])

  const tournaments = [
    {
      game: "Valorant",
      prize: "₹5,000",
      icon: <Flame size={40} />,
      color: "from-red-500 to-orange-500",
    },
    {
      game: "BGMI",
      prize: "₹10,000",
      icon: <Trophy size={40} />,
      color: "from-yellow-500 to-orange-400",
    },
    {
      game: "CS2",
      prize: "₹3,000",
      icon: <Swords size={40} />,
      color: "from-blue-500 to-cyan-400",
    },
  ]

  async function register(game) {

    if (!user) {
      alert("Please login first")
      return
    }

    const { error } = await supabase
      .from("registrations")
      .insert([
        {
          email: user.email,
          tournament: game,
        },
      ])

    if (error) {
      alert(error.message)
    } else {
      alert(`Registered for ${game}`)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden p-8">

      {/* Glow Effects */}
      <div className="absolute top-[-150px] left-[-100px] w-[500px] h-[500px] bg-purple-600 opacity-20 blur-3xl rounded-full"></div>

      <div className="absolute bottom-[-150px] right-[-100px] w-[500px] h-[500px] bg-blue-500 opacity-20 blur-3xl rounded-full"></div>

      <div className="relative z-10">

        {/* Heading */}
        <div className="mb-16 text-center">

          <h1 className="text-6xl md:text-7xl font-black">
            TOURNAMENTS
          </h1>

          <p className="text-zinc-400 mt-6 text-xl max-w-2xl mx-auto">
            Battle elite players, dominate ranked matches,
            and earn rewards in competitive tournaments.
          </p>

        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-8">

          {tournaments.map((tournament, index) => (

            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ scale: 1.03 }}
              className="bg-zinc-900/80 border border-zinc-800 backdrop-blur-lg rounded-3xl overflow-hidden"
            >

              {/* Top Gradient */}
              <div className={`bg-gradient-to-r ${tournament.color} p-8`}>

                <div className="mb-6">
                  {tournament.icon}
                </div>

                <h2 className="text-4xl font-black">
                  {tournament.game}
                </h2>

              </div>

              {/* Content */}
              <div className="p-8">

                <p className="text-zinc-400">
                  Prize Pool
                </p>

                <p className="text-4xl font-black mt-3">
                  {tournament.prize}
                </p>

                <button
                  onClick={() => register(tournament.game)}
                  className="w-full mt-8 bg-white text-black py-4 rounded-2xl font-black hover:scale-105 transition duration-300"
                >
                  Register Now
                </button>

              </div>

            </motion.div>

          ))}

        </div>

      </div>

    </div>
  )
}