'use client'

import { useState, useEffect } from 'react'
import { getSupabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import useUserStore from '@/stores/useUserStore'
import { ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import ScreenHeader from '@/components/ui/ScreenHeader'
import SearchField from '@/components/ui/SearchField'
import ArenaCard from '@/components/ui/ArenaCard'
import { PrimaryButton } from '@/components/ui/ActionButton'

export default function ClubSelection() {
  const [name, setName] = useState('')
  const [selectedClub, setSelectedClub] = useState(null)
  const [loading, setLoading] = useState(false)
  const [clubs, setClubs] = useState([])
  const [search, setSearch] = useState('')
  const [guestParamEnabled] = useState(() => {
    if (typeof window === 'undefined') return false
    return new URLSearchParams(window.location.search).get('guest') === '1'
  })
  const router = useRouter()
  const setUser = useUserStore((state) => state.setUser)
  const setClub = useUserStore((state) => state.setClub)
  const setClubId = useUserStore((state) => state.setClubId)
  const isGuest = useUserStore((state) => state.isGuest)
  const setGuestMode = useUserStore((state) => state.setGuestMode)
  const startGuestSession = useUserStore((state) => state.startGuestSession)

  const guestMode = guestParamEnabled || isGuest

  useEffect(() => {
    setGuestMode(guestMode)
  }, [guestMode, setGuestMode])

  useEffect(() => {
    const checkSession = async () => {
      if (guestMode) return
      const { data: { session } } = await getSupabase().auth.getSession()
      if (!session) router.push('/login')
    }
    checkSession()
  }, [guestMode, router])

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
    const guestUser = {
      id: `guest-${Date.now()}`,
      email: null,
      name,
    }
    const { data: { session } } = guestMode
      ? { data: { session: null } }
      : await getSupabase().auth.getSession()

    if (guestMode) {
      startGuestSession(guestUser)
      setClub(selectedClub.name)
      setClubId(selectedClub.id)
      router.push('/dashboard')
    } else if (session) {
      const { error } = await getSupabase()
        .from('users')
        .upsert({
          id: session.user.id,
          email: session.user.email,
          name,
          club: selectedClub.name,
          club_id: selectedClub.id,
          updated_at: new Date()
        })

      if (error) {
        console.error('Error updating profile:', error)
        alert('Error saving profile')
      } else {
        setUser({ id: session.user.id, email: session.user.email, name })
        setGuestMode(false)
        setClub(selectedClub.name)
        setClubId(selectedClub.id)
        router.push('/dashboard')
      }
    }
    setLoading(false)
  }

  const filteredClubs = clubs.filter((club) =>
    club.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main className="arena-shell px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mx-auto max-w-5xl"
      >
        <button
          type="button"
          onClick={() => router.push('/login')}
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="metadata-label">Back</span>
        </button>

        <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-6">
            <ScreenHeader
              eyebrow={guestMode ? 'Guest Setup' : 'Profile Setup'}
              title="Choose your club."
              subtitle={guestMode
                ? 'Jump in as a guest, choose your fan identity, and head straight into the live lobby.'
                : 'Pick your fan identity, save your name, and head straight into the live lobby.'}
            />

            <ArenaCard className="space-y-4 p-6">
              <label className="metadata-label">Player Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-2xl border border-white/8 bg-black/10 px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary/40"
                placeholder="Enter your username"
              />
              <p className="text-sm text-muted-foreground">
                This name is what your opponent sees during every head-to-head match.
              </p>
            </ArenaCard>

            <PrimaryButton type="submit" disabled={loading || !name || !selectedClub} className="w-full">
              {loading ? 'Saving...' : 'Start Playing'}
            </PrimaryButton>
          </div>

          <ArenaCard glow className="space-y-5 p-6 md:p-8">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <label className="metadata-label">Club Selection</label>
                <span className="metadata-label text-[10px]">{filteredClubs.length} options</span>
              </div>
              <SearchField
                placeholder="Search clubs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {filteredClubs.map((club, index) => (
                <motion.button
                  key={club.id}
                  type="button"
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: Math.min(index * 0.02, 0.18), duration: 0.2 }}
                  onClick={() => setSelectedClub(club)}
                  className={`arena-card flex h-28 flex-col items-center justify-center gap-2 px-3 text-center transition ${
                    selectedClub?.id === club.id
                      ? 'border-primary/60 bg-primary/10 shadow-[0_0_30px_rgba(190,242,100,0.18)]'
                      : 'hover:-translate-y-0.5 hover:border-white/15'
                  }`}
                >
                  <span className="font-display text-sm font-black uppercase tracking-[-0.08em] text-foreground">
                    {club.name}
                  </span>
                  <span className="metadata-label text-[10px]">
                    {selectedClub?.id === club.id ? 'Selected' : 'Choose Club'}
                  </span>
                </motion.button>
              ))}
            </div>
          </ArenaCard>
        </form>
      </motion.div>
    </main>
  )
}
