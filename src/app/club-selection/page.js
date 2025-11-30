'use client'
import { useState, useEffect } from 'react'
import { getSupabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import useUserStore from '@/stores/useUserStore'




export default function ClubSelection() {
  const [name, setName] = useState('')
  const [selectedClub, setSelectedClub] = useState(null)
  const [loading, setLoading] = useState(false)
  const [clubs, setClubs] = useState([])
  const router = useRouter()
  const setUser = useUserStore((state) => state.setUser)
  const setClub = useUserStore((state) => state.setClub)

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await getSupabase().auth.getSession()
      if (!session) router.push('/login')
    }
    checkSession()
  }, [router])

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !selectedClub) return

    setLoading(true)
    const { data: { session } } = await getSupabase().auth.getSession()

    if (session) {
      // Update user profile
      const { error } = await getSupabase()
        .from('users')
        .upsert({
          id: session.user.id,
          email: session.user.email,
          name: name,
          club: selectedClub.name,
          club_id: selectedClub.id,
          updated_at: new Date()
        })

      if (error) {
        console.error('Error updating profile:', error)
        alert('Error saving profile')
      } else {
        setUser({ id: session.user.id, email: session.user.email, name })
        setClub(selectedClub.name)
        router.push('/dashboard')
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Setup Your Profile</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-slate-800 p-6 rounded-xl">
            <label className="block text-lg font-medium mb-4">What should we call you?</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-white"
              placeholder="Enter your username"
            />
          </div>

          <div className="bg-slate-800 p-6 rounded-xl">
            <label className="block text-lg font-medium mb-4">Select Your Club</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {clubs.map((club) => (
                <button
                  key={club.id}
                  type="button"
                  onClick={() => setSelectedClub(club)}
                  className={`p-4 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center h-24 text-center font-bold ${selectedClub?.id === club.id
                    ? 'ring-4 ring-emerald-500 scale-105'
                    : 'opacity-80 hover:opacity-100'
                    } ${club.color}`}
                >
                  {club.name}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !name || !selectedClub}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xl rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
          >
            {loading ? 'Saving...' : 'Start Playing'}
          </button>
        </form>
      </div>
    </div>
  )
}
