import { motion } from "framer-motion"
import { Trophy, Users, Zap, Gamepad2 } from "lucide-react"

export default function Home() {

  const features = [
    {
      icon: <Trophy size={40} />,
      title: "Daily Tournaments",
      desc: "Compete against skilled players and win rewards.",
    },
    {
      icon: <Users size={40} />,
      title: "Elite Community",
      desc: "Squad up with gamers from around the world.",
    },
    {
      icon: <Zap size={40} />,
      title: "Live Events",
      desc: "Late-night scrims, giveaways, and ranked battles.",
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">

      {/* Background Glow */}
      <div className="pointer-events-none absolute top-[-150px] left-[-100px] w-[500px] h-[500px] bg-purple-600 opacity-20 blur-3xl rounded-full"></div>

      <div className="pointer-events-none absolute bottom-[-150px] right-[-100px] w-[500px] h-[500px] bg-blue-500 opacity-20 blur-3xl rounded-full"></div>

      {/* Hero Section */}
      <section className="relative z-10 px-8 py-24 text-center">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >

          <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-5 py-2 rounded-full mb-8">
            <Gamepad2 size={18} />

            <span className="text-sm text-zinc-300">
              Welcome To Daddy Gaming Lobby
            </span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black leading-tight max-w-6xl mx-auto">
            DOMINATE

            <span className="block text-purple-500">
              THE ARENA
            </span>
          </h1>

          <p className="text-zinc-400 text-xl mt-8 max-w-2xl mx-auto leading-relaxed">
            Join tournaments, build your squad,
            climb leaderboards, and become part of
            the next generation gaming community.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-10">

            <button className="bg-white text-black px-8 py-4 rounded-2xl font-bold hover:scale-105 transition duration-300">
              Start Playing
            </button>

            <button className="border border-zinc-700 px-8 py-4 rounded-2xl hover:bg-zinc-900 transition duration-300">
              Explore Tournaments
            </button>

          </div>

        </motion.div>

      </section>

      {/* Feature Cards */}
      <section className="relative z-10 px-8 pb-24">

        <div className="grid md:grid-cols-3 gap-6">

          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ scale: 1.03 }}
              className="bg-zinc-900/80 backdrop-blur-lg border border-zinc-800 rounded-3xl p-8"
            >

              <div className="text-purple-400 mb-6">
                {feature.icon}
              </div>

              <h2 className="text-2xl font-black mb-4">
                {feature.title}
              </h2>

              <p className="text-zinc-400 leading-relaxed">
                {feature.desc}
              </p>

            </motion.div>
          ))}

        </div>

      </section>

      {/* Bottom Banner */}
      <section className="relative z-10 px-8 pb-24">

        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-10 text-center shadow-2xl">

          <h2 className="text-4xl md:text-5xl font-black mb-6">
            READY TO LEVEL UP?
          </h2>

          <p className="text-lg text-zinc-100 max-w-2xl mx-auto mb-8">
            Build your reputation, win tournaments,
            and become a legendary player in the community.
          </p>

          <button className="bg-white text-black px-8 py-4 rounded-2xl font-black hover:scale-105 transition duration-300">
            Join The Community
          </button>

        </div>

      </section>

    </div>
  )
}