'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { socket } from '@/lib/socket'
import useUserStore from '@/stores/useUserStore'
import useGameStore from '@/stores/useGameStore'
import { Trophy, Home, RotateCcw } from 'lucide-react'

export default function Results() {
  const router = useRouter()
  const user = useUserStore((state) => state.user)
  const { scores, opponent, resetGame } = useGameStore()

  useEffect(() => {
    if (!user) router.push('/login')
  }, [user, router])

  const myScore = scores[socket.id] || 0
  const opponentScore = Object.entries(scores).find(([id]) => id !== socket.id)?.[1] || 0

  const isWinner = myScore > opponentScore
  const isDraw = myScore === opponentScore

  const handlePlayAgain = () => {
    resetGame()
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 p-8 rounded-2xl shadow-2xl text-center">
        <div className="mb-8">
          {isWinner ? (
            <div className="inline-block p-4 bg-emerald-500/20 rounded-full mb-4">
              <Trophy className="w-16 h-16 text-emerald-400" />
            </div>
          ) : (
            <div className="inline-block p-4 bg-slate-700 rounded-full mb-4">
              <Trophy className="w-16 h-16 text-slate-500" />
            </div>
          )}

          <h1 className="text-4xl font-black mb-2">
            {isWinner ? 'VICTORY!' : isDraw ? 'DRAW!' : 'DEFEAT'}
          </h1>
          <p className="text-slate-400">
            {isWinner ? 'You dominated the pitch!' : 'Better luck next time.'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-700 p-4 rounded-xl">
            <p className="text-sm text-slate-400 mb-1">You</p>
            <p className="text-3xl font-bold text-emerald-400">{myScore}</p>
          </div>
          <div className="bg-slate-700 p-4 rounded-xl">
            <p className="text-sm text-slate-400 mb-1">{opponent?.name || 'Opponent'}</p>
            <p className="text-3xl font-bold text-red-400">{opponentScore}</p>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={handlePlayAgain}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Play Again
          </button>

          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
