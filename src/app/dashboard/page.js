'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { socket } from '@/lib/socket'
import { getSupabase } from '@/lib/supabaseClient'
import useUserStore from '@/stores/useUserStore'
import useGameStore from '@/stores/useGameStore'
import { ArrowLeft, Copy, LogOut, Play, Search, Shield, Share2, Swords, Trophy, Users } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import ArenaCard from '@/components/ui/ArenaCard'
import ScreenHeader from '@/components/ui/ScreenHeader'
import StatTile from '@/components/ui/StatTile'
import { PrimaryButton, SecondaryButton } from '@/components/ui/ActionButton'

function formatClubLabel(clubName) {
  if (!clubName) return 'N/A'
  const words = clubName.trim().split(/\s+/)
  if (words.length === 1) return clubName.slice(0, 3).toUpperCase()
  return words.slice(0, 3).map((word) => word[0]).join('').toUpperCase()
}

function AutoJoin({ user, club, clubId, setStatus, setError }) {
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get('room')
    if (code && user) {
      socket.emit('join_private_room', {
        roomId: code.toUpperCase(),
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          club,
          club_id: clubId
        }
      }, (response) => {
        if (response.error) {
          setError(response.error)
          setStatus('idle')
        } else {
          setStatus('joining')
        }
      })
    }
  }, [searchParams, user, club, clubId, setError, setStatus])

  return null
}

export default function Dashboard() {
  const router = useRouter()
  const user = useUserStore((state) => state.user)
  const club = useUserStore((state) => state.club)
  const clubId = useUserStore((state) => state.clubId)
  const isGuest = useUserStore((state) => state.isGuest)
  const setUser = useUserStore((state) => state.setUser)
  const setClub = useUserStore((state) => state.setClub)
  const setClubId = useUserStore((state) => state.setClubId)
  const logoutStore = useUserStore((state) => state.logout)
  const { setMatchId, setOpponent, setGameState, resetGame } = useGameStore()

  const [status, setStatus] = useState('idle')
  const [inviteLink, setInviteLink] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [leaderboard, setLeaderboard] = useState([])
  const [leaderboardLoading, setLeaderboardLoading] = useState(true)
  const [leaderboardError, setLeaderboardError] = useState(null)

  useEffect(() => {
    let cancelled = false
    const check = async () => {
      if (isGuest && user && club && clubId) {
        setAuthChecked(true)
        return
      }
      const { data: { session } } = await getSupabase().auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      if (!cancelled) {
        if (!user) {
          const name = session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User'
          setUser({ id: session.user.id, email: session.user.email, name })
        }
        if (!club || !clubId) {
          const { data } = await getSupabase().from('users').select('club, club_id').eq('id', session.user.id).single()
          if (data?.club) setClub(data.club)
          if (data?.club_id) setClubId(data.club_id)
        }
        setAuthChecked(true)
      }
    }
    check()
    return () => { cancelled = true }
  }, [router, user, club, clubId, isGuest, setUser, setClub, setClubId])

  useEffect(() => {
    if (!authChecked || !user) return
    if (!socket.connected) socket.connect()

    function onMatchFound(data) {
      setMatchId(data.matchId)
      const opponentData = typeof data.opponent === 'function' ? data.opponent(socket.id) : data.opponent
      setOpponent(opponentData)
      setGameState('playing')
      router.push('/match')
    }

    socket.on('match_found', onMatchFound)
    return () => {
      socket.off('match_found', onMatchFound)
    }
  }, [authChecked, user, router, setMatchId, setOpponent, setGameState])

  useEffect(() => {
    let cancelled = false

    const loadLeaderboard = async () => {
      setLeaderboardLoading(true)
      setLeaderboardError(null)

      try {
        const supabase = getSupabase()
        const [{ data: matches, error: matchesError }, { data: users, error: usersError }] = await Promise.all([
          supabase
            .from('matches')
            .select('player1_id, player2_id, p1_score, p2_score, winner_id')
            .limit(500),
          supabase
            .from('users')
            .select('id, name, club')
        ])

        if (matchesError) throw matchesError
        if (usersError) throw usersError

        const usersById = new Map((users || []).map((entry) => [entry.id, entry]))
        const aggregate = new Map()

        const ensurePlayer = (playerId) => {
          if (!playerId || !usersById.has(playerId)) return null
          if (!aggregate.has(playerId)) {
            const profile = usersById.get(playerId)
            aggregate.set(playerId, {
              id: playerId,
              name: profile?.name || 'Player',
              club: formatClubLabel(profile?.club),
              totalScore: 0,
              wins: 0,
              matches: 0,
            })
          }
          return aggregate.get(playerId)
        }

        for (const match of matches || []) {
          const player1 = ensurePlayer(match.player1_id)
          const player2 = ensurePlayer(match.player2_id)

          if (player1) {
            player1.totalScore += Number(match.p1_score || 0)
            player1.matches += 1
            if (match.winner_id === match.player1_id) player1.wins += 1
          }

          if (player2) {
            player2.totalScore += Number(match.p2_score || 0)
            player2.matches += 1
            if (match.winner_id === match.player2_id) player2.wins += 1
          }
        }

        const ranked = Array.from(aggregate.values())
          .sort((a, b) => {
            if (b.wins !== a.wins) return b.wins - a.wins
            if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore
            return a.name.localeCompare(b.name)
          })
          .slice(0, 5)
          .map((entry, index) => ({
            rank: index + 1,
            name: entry.name,
            club: entry.club,
            score: entry.totalScore.toLocaleString(),
            wins: entry.wins,
            matches: entry.matches,
          }))

        if (!cancelled) {
          setLeaderboard(ranked)
        }
      } catch (loadError) {
        if (!cancelled) {
          console.error('Error loading leaderboard:', loadError)
          setLeaderboard([])
          setLeaderboardError('Leaderboard unavailable right now.')
        }
      } finally {
        if (!cancelled) {
          setLeaderboardLoading(false)
        }
      }
    }

    loadLeaderboard()

    return () => {
      cancelled = true
    }
  }, [authChecked])

  const handleFindMatch = () => {
    if (!user) {
      router.push('/login')
      return
    }
    setError(null)
    setStatus('searching')
    socket.emit('join_queue', {
      id: user.id,
      email: user.email,
      name: user.name,
      club,
      club_id: clubId
    })
  }

  const handleCreatePrivate = () => {
    if (!user) {
      router.push('/login')
      return
    }
    setError(null)
    setStatus('creating')
    socket.emit('create_private_room', {
      id: user.id,
      email: user.email,
      name: user.name,
      club,
      club_id: clubId
    }, (response) => {
      if (response.roomId) {
        setInviteLink(response.roomId)
        setStatus('idle')
      }
    })
  }

  const handleJoinPrivate = (e) => {
    e.preventDefault()
    if (!joinCode) return
    if (!user) {
      router.push('/login')
      return
    }

    setError(null)
    setStatus('joining')
    socket.emit('join_private_room', {
      roomId: joinCode,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        club,
        club_id: clubId
      }
    }, (response) => {
      if (response.error) {
        setError(response.error)
        setStatus('idle')
      }
    })
  }

  const handleCancelWait = () => {
    socket.emit('cancel_wait')
    setStatus('idle')
    setInviteLink('')
    setError(null)
  }

  const handleLogout = async () => {
    if (!isGuest) {
      try {
        await getSupabase().auth.signOut()
      } catch {}
    }
    socket.disconnect()
    resetGame()
    logoutStore()
    router.push(isGuest ? '/' : '/login')
  }

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined' || !inviteLink) return ''
    return `${window.location.origin}/dashboard?room=${inviteLink}`
  }, [inviteLink])

  const profileReady = authChecked && Boolean(user)

  return (
    <main className="arena-shell min-h-screen px-6 py-6">
      <Suspense fallback={null}>
        <AutoJoin user={user} club={club} clubId={clubId} setStatus={setStatus} setError={setError} />
      </Suspense>

      <div className="relative z-10 mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-4 border-b border-white/5 pb-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => router.push('/club-selection')}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="metadata-label">Club Select</span>
            </button>
            <ScreenHeader
              eyebrow="Arena Lobby"
              title={profileReady ? `Welcome back, ${user.name}.` : 'Preparing your lobby...'}
              subtitle={club
                ? `${isGuest ? 'Guest mode active. ' : ''}You are representing ${club}. Queue up, create a private room, or review the live arena board.`
                : 'Verifying your fan profile and session.'}
            />
          </div>

          <div className="flex items-center gap-3 self-start">
            {club ? (
              <div className="arena-card px-4 py-3 text-right">
                <div className="font-display text-sm font-black uppercase tracking-[-0.08em] text-foreground">{user?.name}</div>
                <div className="metadata-label text-[10px]">{club}</div>
              </div>
            ) : null}
            <SecondaryButton type="button" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Logout
            </SecondaryButton>
          </div>
        </header>

        {!authChecked ? (
          <ArenaCard className="mx-auto max-w-xl p-12 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
              <Search className="h-8 w-8 animate-pulse" />
            </div>
            <h2 className="font-display text-3xl font-black uppercase tracking-[-0.08em] text-foreground">
              Preparing dashboard
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Loading your profile, restoring your club, and reconnecting the live arena.
            </p>
          </ArenaCard>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <section className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <StatTile icon={Shield} label="Club" value={club || 'Unset'} tone="primary" />
                <StatTile icon={Swords} label="Queue Mode" value={inviteLink ? 'Private' : 'Public'} />
                <StatTile icon={Trophy} label="Status" value={status === 'idle' ? 'Ready' : status} tone={status === 'idle' ? 'accent' : 'primary'} />
              </div>

              <ArenaCard glow className="p-6 md:p-8">
                <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="metadata-label">Main Match Actions</p>
                    <h2 className="font-display text-3xl font-black uppercase tracking-[-0.08em] text-foreground">
                      Enter the arena
                    </h2>
                  </div>
                  <p className="max-w-sm text-sm text-muted-foreground">
                    Match instantly with a rival fan or create a private room for a direct challenge.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <PrimaryButton type="button" onClick={handleFindMatch} className="w-full justify-center py-5">
                    <Play className="h-4 w-4" />
                    Play Now
                  </PrimaryButton>

                  <SecondaryButton type="button" onClick={handleCreatePrivate} className="w-full justify-center py-5">
                    <Users className="h-4 w-4" />
                    Challenge a Friend
                  </SecondaryButton>
                </div>
              </ArenaCard>

              <ArenaCard className="p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="metadata-label">Private Rooms</p>
                    <h3 className="font-display text-2xl font-black uppercase tracking-[-0.08em] text-foreground">
                      Invite flow
                    </h3>
                  </div>
                  {inviteLink ? <span className="metadata-label text-primary">Room Live</span> : null}
                </div>

                {!inviteLink ? (
                  <p className="mb-6 text-sm text-muted-foreground">
                    Generate a code for a direct challenge, then share the link or let another player join with the room code.
                  </p>
                ) : (
                  <div className="mb-6 rounded-3xl border border-primary/20 bg-primary/10 p-5">
                    <div className="metadata-label">Share this code</div>
                    <div className="font-display mt-3 text-4xl font-black uppercase tracking-[0.2em] text-primary neon-text">
                      {inviteLink}
                    </div>
                    {shareUrl ? (
                      <p className="mt-3 break-all text-xs text-muted-foreground">{shareUrl}</p>
                    ) : null}
                    <div className="mt-4 flex flex-wrap gap-3">
                      <SecondaryButton type="button" onClick={() => navigator.clipboard.writeText(inviteLink)}>
                        <Copy className="h-4 w-4" />
                        Copy Code
                      </SecondaryButton>
                      {shareUrl ? (
                        <SecondaryButton type="button" onClick={() => navigator.clipboard.writeText(shareUrl)}>
                          <Copy className="h-4 w-4" />
                          Copy Link
                        </SecondaryButton>
                      ) : null}
                      {shareUrl && typeof navigator !== 'undefined' && navigator.share ? (
                        <SecondaryButton
                          type="button"
                          onClick={() => navigator.share({
                            title: 'fan_h2h Private Room',
                            text: 'Join my private match',
                            url: shareUrl
                          }).catch(() => {})}
                        >
                          <Share2 className="h-4 w-4" />
                          Share
                        </SecondaryButton>
                      ) : null}
                    </div>
                  </div>
                )}

                <form onSubmit={handleJoinPrivate} className="space-y-3">
                  <label className="metadata-label">Join by Code</label>
                  <div className="flex flex-col gap-3 md:flex-row">
                    <input
                      type="text"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      placeholder="ENTER CODE"
                      className="flex-1 rounded-2xl border border-white/8 bg-black/10 px-4 py-3 text-center font-mono uppercase tracking-[0.25em] text-foreground outline-none transition focus:border-primary/40"
                    />
                    <PrimaryButton type="submit" disabled={!joinCode} className="justify-center md:min-w-44">
                      Join Room
                    </PrimaryButton>
                  </div>
                  {error ? <p className="text-sm text-red-300">{error}</p> : null}
                </form>
              </ArenaCard>
            </section>

            <aside className="space-y-6">
              <ArenaCard className="p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="metadata-label">Leaderboard</p>
                    <h3 className="font-display text-2xl font-black uppercase tracking-[-0.08em] text-foreground">
                      Arena board
                    </h3>
                  </div>
                  <span className="metadata-label text-[10px]">{leaderboardLoading ? 'Loading' : 'Live'}</span>
                </div>
                {leaderboardLoading ? (
                  <div className="space-y-3">
                    {[0, 1, 2].map((index) => (
                      <div key={index} className="arena-card flex items-center justify-between px-4 py-3 opacity-60">
                        <div className="flex items-center gap-3">
                          <div className="h-4 w-8 rounded bg-white/10" />
                          <div className="space-y-2">
                            <div className="h-4 w-24 rounded bg-white/10" />
                            <div className="h-3 w-12 rounded bg-white/10" />
                          </div>
                        </div>
                        <div className="h-4 w-16 rounded bg-white/10" />
                      </div>
                    ))}
                  </div>
                ) : leaderboard.length > 0 ? (
                  <div className="space-y-3">
                    {leaderboard.map((entry) => (
                      <div key={`${entry.rank}-${entry.name}`} className="arena-card flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`font-display text-sm font-black ${entry.rank === 1 ? 'gold-text text-accent' : 'text-muted-foreground'}`}>
                            #{entry.rank}
                          </div>
                          <div>
                            <div className="text-sm text-foreground">{entry.name}</div>
                            <div className="metadata-label text-[10px]">{entry.club} • {entry.wins}W / {entry.matches}M</div>
                          </div>
                        </div>
                        <div className="font-display text-sm font-black text-foreground">{entry.score}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="arena-card px-4 py-5 text-sm text-muted-foreground">
                    {leaderboardError || 'No leaderboard data available yet.'}
                  </div>
                )}
              </ArenaCard>

              <ArenaCard className="p-6">
                <p className="metadata-label">Session Notes</p>
                <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                  <p>Random matchmaking and private room actions are still powered by the existing socket events.</p>
                  <p>Authenticated and guest sessions both use the same socket matchmaking flow, with guest mode bypassing Supabase profile writes.</p>
                </div>
              </ArenaCard>
            </aside>
          </div>
        )}
      </div>

      <AnimatePresence>
        {status !== 'idle' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 flex items-center justify-center bg-[#020617]/85 px-6 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-md"
            >
              <ArenaCard glow className="p-10 text-center">
                <div className="relative mx-auto mb-8 flex h-24 w-24 items-center justify-center">
                  {[0, 1, 2].map((ring) => (
                    <span
                      key={ring}
                      className="pulse-ring absolute h-24 w-24 rounded-full border border-primary/30"
                    />
                  ))}
                  <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
                    <Search className="h-7 w-7" />
                  </div>
                </div>
                <h2 className="font-display text-3xl font-black uppercase tracking-[-0.08em] text-foreground">
                  {status === 'searching' ? 'Searching for opponent' : status === 'creating' ? 'Opening private room' : 'Joining private room'}
                </h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  {status === 'searching'
                    ? 'Matching you with a rival fan in real time.'
                    : 'Holding your lobby state until the room is ready.'}
                </p>
                <div className="animated-dots mt-5 flex justify-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span className="h-2 w-2 rounded-full bg-primary" />
                </div>
                <SecondaryButton type="button" onClick={handleCancelWait} className="mt-8 w-full justify-center">
                  Cancel
                </SecondaryButton>
              </ArenaCard>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  )
}
