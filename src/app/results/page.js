'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { socket } from '@/lib/socket'
import useUserStore from '@/stores/useUserStore'
import useGameStore from '@/stores/useGameStore'
import { Home, LogOut, RotateCcw, Trophy } from 'lucide-react'
import { motion } from 'framer-motion'
import { getSupabase } from '@/lib/supabaseClient'
import ArenaCard from '@/components/ui/ArenaCard'
import { PrimaryButton, SecondaryButton } from '@/components/ui/ActionButton'

export default function Results() {
  const router = useRouter()
  const user = useUserStore((state) => state.user)
  const isGuest = useUserStore((state) => state.isGuest)
  const { scores, finalScores, winnerId, opponent, resetGame } = useGameStore()
  const logoutStore = useUserStore((state) => state.logout)

  useEffect(() => {
    if (!user) router.push('/login')
  }, [user, router])

  const handleLogout = async () => {
    if (!isGuest) {
      try { await getSupabase().auth.signOut() } catch {}
    }
    resetGame()
    logoutStore()
    router.push(isGuest ? '/' : '/login')
  }

  const resolvedScores = finalScores || scores
  const myScore = resolvedScores[socket.id] || 0
  const opponentScore = Object.entries(resolvedScores).find(([id]) => id !== socket.id)?.[1] || 0
  const isDraw = winnerId === null ? myScore === opponentScore : false
  const isWinner = winnerId ? winnerId === user?.id : myScore > opponentScore

  const handlePlayAgain = () => {
    resetGame()
    router.push('/dashboard')
  }

  return (
    <main className="arena-shell flex min-h-screen items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-2xl"
      >
        <ArenaCard glow className="overflow-hidden p-8 text-center md:p-12">
          <div className={`absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full blur-3xl ${
            isWinner ? 'bg-primary/15' : isDraw ? 'bg-accent/10' : 'bg-destructive/15'
          }`} />

          <div className="relative space-y-8">
            <div className="space-y-4">
              <div className={`mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full border ${
                isWinner ? 'border-primary/30 bg-primary/10 text-primary' : 'border-white/10 bg-white/5 text-muted-foreground'
              }`}>
                <Trophy className="h-10 w-10" />
              </div>
              <div>
                <div className="metadata-label">Match Result</div>
                <h1 className={`font-display mt-3 text-5xl font-black uppercase tracking-[-0.1em] ${
                  isWinner ? 'text-primary neon-text' : isDraw ? 'text-accent gold-text' : 'text-destructive'
                }`}>
                  {isWinner ? 'Victory' : isDraw ? 'Draw' : 'Defeat'}
                </h1>
                <p className="mt-3 text-sm text-muted-foreground">
                  {isWinner ? 'You owned the arena this round.' : isDraw ? 'A dead-even battle. Run it back.' : 'The rival fan took this one. Queue again for revenge.'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <div className="font-display text-5xl font-black text-primary">{myScore}</div>
                <div className="metadata-label mt-2">{user?.name || 'You'}</div>
              </div>
              <div className="font-display text-2xl text-muted-foreground">VS</div>
              <div className="text-center">
                <div className="font-display text-5xl font-black text-destructive">{opponentScore}</div>
                <div className="metadata-label mt-2">{opponent?.name || 'Opponent'}</div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <ArenaCard className="p-5">
                <div className="metadata-label">Accuracy Pulse</div>
                <div className="font-display mt-3 text-3xl font-black text-foreground">
                  {myScore + opponentScore > 0 ? `${Math.round((myScore / (myScore + opponentScore)) * 100)}%` : '0%'}
                </div>
              </ArenaCard>
              <ArenaCard className="p-5">
                <div className="metadata-label">Opponent</div>
                <div className="font-display mt-3 text-3xl font-black text-foreground">
                  {opponent?.name || 'Rival'}
                </div>
              </ArenaCard>
            </div>

            <div className="flex flex-col gap-3">
              <PrimaryButton type="button" onClick={handlePlayAgain} className="w-full justify-center">
                <RotateCcw className="h-4 w-4" />
                Play Again
              </PrimaryButton>
              <SecondaryButton type="button" onClick={() => router.push('/dashboard')} className="w-full justify-center">
                <Home className="h-4 w-4" />
                Back to Dashboard
              </SecondaryButton>
              <SecondaryButton type="button" onClick={handleLogout} className="w-full justify-center">
                <LogOut className="h-4 w-4" />
                Logout
              </SecondaryButton>
            </div>
          </div>
        </ArenaCard>
      </motion.div>
    </main>
  )
}
