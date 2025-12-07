'use client'
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { socket } from '@/lib/socket'
import { getSupabase } from '@/lib/supabaseClient'
import useUserStore from '@/stores/useUserStore'
import useGameStore from '@/stores/useGameStore'
import { Copy, Users, Play, Search, Share2 } from 'lucide-react'
import TopBar from '@/components/TopBar'
import SearchingStatus from '@/components/SearchingStatus'
import JoiningStatus from '@/components/JoiningStatus'
import IdleStatus from '@/components/IdleStatus'
import HowToPlay from '@/components/HowToPlay'

export default function Dashboard() {
  const router = useRouter()
  const user = useUserStore((state) => state.user)
  const club = useUserStore((state) => state.club)
  const clubId = useUserStore((state) => state.clubId)
  const setUser = useUserStore((state) => state.setUser)
  const setClub = useUserStore((state) => state.setClub)
  const setClubId = useUserStore((state) => state.setClubId)
  const { setMatchId, setOpponent, setGameState, setQuestions, resetGame } = useGameStore()
  const logoutStore = useUserStore((state) => state.logout)

  const [status, setStatus] = useState('idle')
  const [inviteLink, setInviteLink] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [showHowToPlay, setShowHowToPlay] = useState(false)
  const isGuest = useUserStore((state) => state.isGuest)

  useEffect(() => {
    let cancelled = false
    const check = async () => {
      // If user is a guest, skip Supabase auth check
      if (isGuest && user) {
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
  }, [router, user, club, isGuest, setUser, setClub])

  useEffect(() => {
    if (!authChecked || !user) return
    if (!socket.connected) {
      socket.connect()
    }
    function onMatchFound(data) {
      setMatchId(data.matchId)
      const opp = typeof data.opponent === 'function' ? data.opponent(socket.id) : data.opponent
      setOpponent(opp)
      setGameState('playing')
      router.push('/match')
    }
    socket.on('match_found', onMatchFound)
    return () => {
      socket.off('match_found', onMatchFound)
    }
  }, [authChecked, user, router, setMatchId, setOpponent, setGameState])

  function AutoJoin({ user, club, setStatus, setError }) {
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
            club: club,
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
    }, [searchParams, user, club])
    return null
  }

  const handleFindMatch = () => {
    if (!user) {
      router.push('/login')
      return
    }
    setStatus('searching')
    socket.emit('join_queue', {
      id: user.id,
      email: user.email,
      name: user.name,
      club: club,
      club_id: clubId
    })
  }

  const handleCreatePrivate = () => {
    if (!user) {
      router.push('/login')
      return
    }
    socket.emit('create_private_room', {
      id: user.id,
      email: user.email,
      name: user.name,
      club: club,
      club_id: clubId
    }, (response) => {
      if (response.roomId) {
        setInviteLink(response.roomId)
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

    setStatus('joining')
    socket.emit('join_private_room', {
      roomId: joinCode,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        club: club,
        club_id: clubId
      }
    }, (response) => {
      if (response.error) {
        setError(response.error)
        setStatus('idle')
      } else {
        // Success, wait for match_found event
        console.log('Joined room, waiting for match start...')
      }
    })
  }

  const handleCancelWait = () => {
    socket.emit('cancel_wait')
    setStatus('idle')
    setInviteLink('')
    setError(null)
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* <header className="flex justify-between items-center max-w-4xl mx-auto py-6">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
          fan_h2h
        </h1>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-bold">{user?.name}</p>
            <p className="text-sm text-slate-400">{club}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm"
          >
            Logout
          </button>
        </div>
      </header> */}
      <TopBar />

      <Suspense fallback={null}><AutoJoin user={user} club={club} setStatus={setStatus} setError={setError} /></Suspense>
      {!authChecked ? (
        <main className="max-w-md mx-auto mt-12">
          <div className="bg-slate-800 p-8 rounded-2xl text-center">
            <Search className="w-12 h-12 mx-auto text-emerald-400 mb-4 animate-pulse" />
            <h2 className="text-2xl font-bold mb-2">Preparing dashboard...</h2>
          </div>
        </main>
      ) : (
        <>
          <main className='grid grid-cols-1 md:grid-cols-4 mt-8 gap-6 w-full max-w-7xl mx-auto px-4 pb-8'>
            <section className="col-span-1 hidden md:block w-full">
              <div className="sticky top-4 bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl">
                <HowToPlay />
              </div>
            </section>
            <div className='col-span-1 lg:col-span-2 w-full space-y-6'>
              <section className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-xl">
                <div className="md:hidden flex justify-end mb-4">
                  <button
                    onClick={() => setShowHowToPlay(true)}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 hover:border-emerald-500/50 text-white rounded-lg text-sm font-medium transition-all"
                  >
                    📖 How to Play
                  </button>
                </div>
                {/* Status Display */}
                {status === 'searching' && (
                  <SearchingStatus handleCancelWait={handleCancelWait} />
                )}

                {status === 'joining' && (
                  <JoiningStatus handleCancelWait={handleCancelWait} />
                )}

                {status === 'idle' && (
                  <IdleStatus
                    handleFindMatch={handleFindMatch}
                    handleCreatePrivate={handleCreatePrivate}
                    inviteLink={inviteLink}
                    handleJoinPrivate={handleJoinPrivate}
                    joinCode={joinCode}
                    setJoinCode={setJoinCode}
                    error={error}
                    setError={setError}
                    handleCancelWait={handleCancelWait}
                  />
                )}

              </section>

              {/* Recent Form Section - Hidden for guests */}
              {!isGuest && (
                <section className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-2xl">📊</div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Recent Form</h2>
                  </div>
                  <div className="text-center py-8 text-slate-400">
                    <p className="text-sm">Your match history will appear here</p>
                  </div>
                </section>
              )}
            </div>

            <section className="col-span-1 w-full">
              <div className="sticky top-4 bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="text-2xl">🏆</div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Leaderboard</h3>
                </div>
                <Leaderboard />
              </div>
            </section>
          </main>
          {showHowToPlay && (
            <div className="fixed inset-0 z-50 bg-black/60 flex items-end md:items-center justify-center p-4">
              <div className="bg-slate-900 rounded-2xl w-full max-w-md md:max-w-2xl overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-slate-700">
                  <h3 className="text-lg font-bold">How to Play</h3>
                  <button
                    onClick={() => setShowHowToPlay(false)}
                    className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded"
                  >
                    Close
                  </button>
                </div>
                <div className="max-h-[70vh] overflow-y-auto">
                  <HowToPlay />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
function Leaderboard() {
  const [rows, setRows] = useState([])
  const [clubRows, setClubRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)
  const [view, setView] = useState('players')

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        const { data: matches, error } = await getSupabase()
          .from('matches')
          .select('player1_id, player2_id, p1_score, p2_score, winner_id')
          .order('created_at', { ascending: false })
          .limit(1000)
        if (error) throw error

        const agg = new Map()
        for (const m of matches || []) {
          const p1 = m.player1_id, p2 = m.player2_id
          const w = m.winner_id
          const s1 = m.p1_score || 0
          const s2 = m.p2_score || 0
          if (p1) {
            const a = agg.get(p1) || { user_id: p1, games: 0, wins: 0, points: 0 }
            a.games += 1
            a.points += s1
            if (w && w === p1) a.wins += 1
            agg.set(p1, a)
          }
          if (p2) {
            const a = agg.get(p2) || { user_id: p2, games: 0, wins: 0, points: 0 }
            a.games += 1
            a.points += s2
            if (w && w === p2) a.wins += 1
            agg.set(p2, a)
          }
        }

        const ids = Array.from(agg.keys())
        let profiles = []
        if (ids.length) {
          const { data: users, error: uerr } = await getSupabase()
            .from('users')
            .select('id, name, club')
            .in('id', ids)
          if (!uerr && Array.isArray(users)) profiles = users
        }

        const byId = new Map(profiles.map(p => [p.id, p]))
        const list = Array.from(agg.values()).map(r => ({
          ...r,
          name: byId.get(r.user_id)?.name || 'Player',
          club: byId.get(r.user_id)?.club || ''
        }))
        list.sort((a, b) => (b.wins - a.wins) || (b.points - a.points))
        if (!cancelled) setRows(list.slice(0, 10))

        const clubAgg = new Map()
        for (const r of list) {
          const key = r.club || 'Unknown'
          const c = clubAgg.get(key) || { club: key, wins: 0, games: 0, points: 0 }
          c.wins += r.wins
          c.games += r.games
          c.points += r.points
          clubAgg.set(key, c)
        }
        const clubList = Array.from(clubAgg.values())
          .filter(c => c.club && c.club !== 'Unknown')
          .sort((a, b) => (b.wins - a.wins) || (b.points - a.points))
        if (!cancelled) setClubRows(clubList.slice(0, 10))
      } catch (e) {
        if (!cancelled) setErr('Failed to load leaderboard')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return <div className="text-slate-400">Loading leaderboard...</div>
  }
  if (err) {
    return <div className="text-red-400">{err}</div>
  }
  const noData = view === 'players' ? !rows.length : !clubRows.length
  if (noData) return <div className="text-slate-400">No matches yet</div>

  return (
    <div className="space-y-4">
      <div className="flex gap-2 bg-slate-900/50 p-1 rounded-lg">
        <button
          onClick={() => setView('players')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${view === 'players'
            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20'
            : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
        >
          👥 Players
        </button>
        <button
          onClick={() => setView('clubs')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${view === 'clubs'
            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20'
            : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
        >
          ⚽ Clubs
        </button>
      </div>

      {view === 'players' ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">#</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Player</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Club</th>
                <th className="text-right px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">W</th>
                <th className="text-right px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">G</th>
                <th className="text-right px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Pts</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.user_id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${i === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                      i === 1 ? 'bg-slate-400/20 text-slate-300' :
                        i === 2 ? 'bg-orange-600/20 text-orange-400' :
                          'text-slate-400'
                      }`}>
                      {i + 1}
                    </span>
                  </td>
                  <td className="px-3 py-3 font-semibold text-white">{r.name}</td>
                  <td className="px-3 py-3 text-xs text-slate-400">{r.club}</td>
                  <td className="px-3 py-3 text-right font-medium text-emerald-400">{r.wins}</td>
                  <td className="px-3 py-3 text-right text-slate-300">{r.games}</td>
                  <td className="px-3 py-3 text-right font-semibold text-white">{r.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">#</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Club</th>
                <th className="text-right px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">W</th>
                <th className="text-right px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">G</th>
                <th className="text-right px-3 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Pts</th>
              </tr>
            </thead>
            <tbody>
              {clubRows.map((c, i) => (
                <tr key={c.club} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${i === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                      i === 1 ? 'bg-slate-400/20 text-slate-300' :
                        i === 2 ? 'bg-orange-600/20 text-orange-400' :
                          'text-slate-400'
                      }`}>
                      {i + 1}
                    </span>
                  </td>
                  <td className="px-3 py-3 font-semibold text-white">{c.club}</td>
                  <td className="px-3 py-3 text-right font-medium text-emerald-400">{c.wins}</td>
                  <td className="px-3 py-3 text-right text-slate-300">{c.games}</td>
                  <td className="px-3 py-3 text-right font-semibold text-white">{c.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
