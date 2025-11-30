'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { socket } from '@/lib/socket'
import useUserStore from '@/stores/useUserStore'
import useGameStore from '@/stores/useGameStore'
import { Copy, Users, Play, Search } from 'lucide-react'

export default function Dashboard() {
  const router = useRouter()
  const user = useUserStore((state) => state.user)
  const club = useUserStore((state) => state.club)
  const { setMatchId, setOpponent, setGameState, setQuestions } = useGameStore()

  const [status, setStatus] = useState('idle') // idle, searching, creating, joining
  const [inviteLink, setInviteLink] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    // Connect socket
    if (!socket.connected) {
      socket.connect()
    }

    // Socket listeners
    function onMatchFound(data) {
      console.log('Match found!', data)
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
  }, [user, router, setMatchId, setOpponent, setGameState])

  // Auto-join via URL parameter ?room=CODE
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
          club: club
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
      club: club
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
      club: club
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
        club: club
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
    <div className="min-h-screen bg-slate-900 text-white p-4">
      <header className="flex justify-between items-center max-w-4xl mx-auto py-6">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
          fan_h2h
        </h1>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-bold">{user?.name}</p>
            <p className="text-sm text-slate-400">{club}</p>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto mt-12 space-y-8">
        {/* Status Display */}
        {status === 'searching' && (
          <div className="bg-slate-800 p-8 rounded-2xl text-center">
            <Search className="w-12 h-12 mx-auto text-emerald-400 mb-4 animate-pulse" />
            <h2 className="text-2xl font-bold mb-2">Searching for opponent...</h2>
            <p className="text-slate-400 mb-4">Matching you with a rival fan</p>
            <button
              onClick={handleCancelWait}
              className="mt-2 px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {status === 'joining' && (
          <div className="bg-slate-800 p-8 rounded-2xl text-center">
            <Search className="w-12 h-12 mx-auto text-purple-400 mb-4 animate-pulse" />
            <h2 className="text-2xl font-bold mb-2">Joining private room...</h2>
            <p className="text-slate-400 mb-4">Waiting for match to start</p>
            <button
              onClick={handleCancelWait}
              className="mt-2 px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {status === 'idle' && (
          <>
            <button
              onClick={handleFindMatch}
              className="w-full py-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-2xl rounded-2xl shadow-lg shadow-emerald-500/20 transition-all transform hover:scale-105 flex items-center justify-center gap-3"
            >
              <Play className="w-8 h-8" />
              Find Match
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-900 text-slate-500">OR</span>
              </div>
            </div>

            <div className="bg-slate-800 p-6 rounded-xl space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-bold mb-2 flex items-center justify-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  Play with Friend
                </h3>
              </div>

              {!inviteLink ? (
                <button
                  onClick={handleCreatePrivate}
                  className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Create Private Room
                </button>
              ) : (
                <div className="bg-slate-900 p-4 rounded-lg text-center">
                  <p className="text-sm text-slate-400 mb-2">Share this code or link:</p>
                  <div className="text-3xl font-mono font-bold text-emerald-400 tracking-widest mb-2">
                    {inviteLink}
                  </div>
                  <div className="text-xs text-slate-500 mb-3 break-all">
                    {typeof window !== 'undefined' && `${window.location.origin}/dashboard?room=${inviteLink}`}
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(`${window.location.origin}/dashboard?room=${inviteLink}`)}
                    className="mr-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" /> Copy Link
                  </button>
                  <button
                    onClick={handleCancelWait}
                    className="mt-2 px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}

              <form onSubmit={handleJoinPrivate} className="pt-4 border-t border-slate-700">
                <label className="block text-sm text-slate-400 mb-2">Have a code?</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="ENTER CODE"
                    className="flex-1 px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono text-center uppercase"
                  />
                  <button
                    type="submit"
                    disabled={!joinCode}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-lg transition-colors"
                  >
                    Join
                  </button>
                </div>
                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
              </form>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
