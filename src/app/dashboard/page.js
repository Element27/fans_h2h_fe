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

  useEffect(() => {
    let cancelled = false
    const check = async () => {
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
  }, [router, user, club, setUser, setClub])

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
    setStatus('creating')
    socket.emit('create_private_room', {
      id: user.id,
      email: user.email,
      name: user.name,
      club: club,
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
    <div className="no-scrollbar bg-slate-900 text-white p-4">
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
          <main className='grid grid-cols-1 md:grid-cols-4  mt-12 gap-8 w-full no-scrollbar lg:px-4'>
            <section className="col-span-1 hidden md:block w-full mx-auto space-y-8 shadow-blue-200 shadow rounded-xl p-2">
              <HowToPlay />
            </section>
            <div className='col-span-1 lg:col-span-2 w-full'>
              <section className=" w-full mx-auto space-y-8 shadow-blue-200 shadow rounded-xl p-4 h-fit">
                <div className="md:hidden flex justify-end">
                  <button
                    onClick={() => setShowHowToPlay(true)}
                    className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm"
                  >
                    How to Play
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
              <section>
                <h1>Recent Form</h1>
              </section>
            </div>

            <section className="col-span-1 w-full mx-auto space-y-8 shadow-blue-200 shadow rounded-xl p-4">
              <div>Leader Board</div>
              {/* <HowToPlay /> */}
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
