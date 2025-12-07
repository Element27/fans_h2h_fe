'use client'
import { useState, useEffect } from 'react'
import { getSupabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import useUserStore from '@/stores/useUserStore'
import { Users, Sparkles } from 'lucide-react'

export default function GuestSetup() {
  const [name, setName] = useState('')
  const [selectedClub, setSelectedClub] = useState(null)
  const [clubs, setClubs] = useState([])
  const router = useRouter()
  const setGuestUser = useUserStore((state) => state.setGuestUser)

  useEffect(() => {
    const loadClubs = async () => {
      const { data, error } = await getSupabase()
        .from('clubs')
        .select('*')
        .order('name', { ascending: true })

      if (error) {
        console.error('Error loading clubs:', error)
      } else {
        setClubs(data || [])
      }
    }
    loadClubs()
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!selectedClub) return

    // Set guest user in store (no database save)
    setGuestUser(name, selectedClub.name, selectedClub.id)
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <Users className="w-10 h-10 text-purple-400" />
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Guest Setup
            </h1>
          </div>
          <p className="text-slate-400 text-sm">
            Play without signing up! Your data won't be saved.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Input */}
          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-6 rounded-2xl shadow-xl">
            <label className="block text-lg font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              Display Name (Optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-lg focus:ring-2 focus:ring-purple-500/50 focus:outline-none text-white placeholder-slate-500"
              placeholder="Leave blank for random name"
            />
            <p className="text-xs text-slate-500 mt-2">
              {name ? `You'll be known as "${name}"` : "We'll generate a random name for you"}
            </p>
          </div>

          {/* Club Selection */}
          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-6 rounded-2xl shadow-xl">
            <label className="block text-lg font-semibold mb-4">Select Your Club</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {clubs.map((club) => (
                <button
                  key={club.id}
                  type="button"
                  onClick={() => setSelectedClub(club)}
                  className={`p-4 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center h-24 text-center font-bold ${selectedClub?.id === club.id
                      ? 'ring-4 ring-purple-500 scale-105 shadow-lg shadow-purple-500/20'
                      : 'opacity-80 hover:opacity-100'
                    } ${club.color}`}
                >
                  {club.name}
                </button>
              ))}
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-purple-500/10 border border-purple-500/30 p-4 rounded-xl">
            <p className="text-sm text-purple-300 text-center">
              ℹ️ As a guest, your match results won't be saved to the leaderboard
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!selectedClub}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl shadow-lg shadow-purple-500/20 transition-all"
          >
            {selectedClub ? 'Start Playing' : 'Select a Club to Continue'}
          </button>

          {/* Back Link */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="text-slate-400 hover:text-white text-sm transition-colors"
            >
              ← Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
