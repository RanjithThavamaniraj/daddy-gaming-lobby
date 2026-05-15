import { Trophy, Users, Gamepad2 } from "lucide-react"
import { motion } from "framer-motion"

export default function Home() {
  const features = [
    {
      icon: <Trophy size={40} />,
      title: "Daily Tournaments",
      desc: "Compete in community tournaments every day.",
    },
    {
      icon: <Users size={40} />,
      title: "Active Community",
      desc: "Squad up with gamers from around the world.",
    },
    {
      icon: <Gamepad2 size={40} />,
      title: "Gaming Events",
      desc: "Late-night events, giveaways, and ranked matches.",
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">

      <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] bg-purple-500 opacity-20 blur-3xl rounded-full"></div>

      <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-blue-500 opacity-20 blur-3xl rounded-full"></div>

      <section className="text-center py-28 px-6 relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-6xl md:text-7xl font-black leading-tight max-w-5xl mx-auto"
        >
          Enter The Ultimate Gaming Universe
        </motion.h2>

        <p className="text-zinc-400 mt-8 text-xl max-w-2xl mx-auto">
          Join elite tournaments, meet cracked teammates,
          and dominate the leaderboards.
        </p>
      </section>

      <section className="grid md:grid-cols-3 gap-6 px-8 pb-24 relative z-10">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            className="bg-zinc-900/80 backdrop-blur-lg border border-zinc-800 rounded-3xl p-8"
          >
            <div className="mb-6 text-purple-400">
              {feature.icon}
            </div>

            <h3 className="text-2xl font-bold mb-4">
              {feature.title}
            </h3>

            <p className="text-zinc-400">
              {feature.desc}
            </p>
          </motion.div>
        ))}
      </section>
    </div>
  )
}