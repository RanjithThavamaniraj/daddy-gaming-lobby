export default function Tournaments() {
    const tournaments = [
      {
        game: "Valorant",
        prize: "₹5,000",
      },
      {
        game: "BGMI",
        prize: "₹10,000",
      },
      {
        game: "CS2",
        prize: "₹3,000",
      },
    ]
  
    return (
      <div className="min-h-screen bg-black text-white p-10">
        <h1 className="text-5xl font-black mb-10">
          Tournaments
        </h1>
  
        <div className="grid md:grid-cols-3 gap-6">
          {tournaments.map((tournament, index) => (
            <div
              key={index}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6"
            >
              <h2 className="text-3xl font-bold">
                {tournament.game}
              </h2>
  
              <p className="text-zinc-400 mt-4">
                Prize Pool
              </p>
  
              <p className="text-2xl font-bold">
                {tournament.prize}
              </p>
  
              <button className="mt-6 w-full bg-white text-black py-3 rounded-xl font-bold">
                Register
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  }