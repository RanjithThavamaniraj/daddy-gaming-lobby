import { useEffect, useState } from "react"
import { supabase } from "../supabase"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })
  }, [])

  async function signUp() {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      alert(error.message)
    } else {
      alert("Account created!")
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
  }

  if (user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="bg-zinc-900 p-10 rounded-3xl text-center">

          <h1 className="text-4xl font-black mb-4">
            Welcome Gamer 🎮
          </h1>

          <p className="text-zinc-400 mb-8">
            {user.email}
          </p>

          <button
            onClick={signOut}
            className="bg-white text-black px-6 py-3 rounded-xl font-bold"
          >
            Logout
          </button>

        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="bg-zinc-900 p-10 rounded-3xl w-full max-w-md">

        <h1 className="text-4xl font-black mb-8">
          Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-4 rounded-xl bg-zinc-800 mb-4"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-4 rounded-xl bg-zinc-800 mb-6"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={signUp}
          className="w-full bg-white text-black py-4 rounded-xl font-bold"
        >
          Create Account
        </button>

      </div>
    </div>
  )
}