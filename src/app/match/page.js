'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { socket } from '@/lib/socket'
import useUserStore from '@/stores/useUserStore'
import useGameStore from '@/stores/useGameStore'
import { CheckCircle2, XCircle } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import ArenaCard from '@/components/ui/ArenaCard'
import CountdownRing from '@/components/ui/CountdownRing'

export default function Match() {
  const router = useRouter()
  const user = useUserStore((state) => state.user)
  const {
    matchId,
    opponent,
    scores,
    updateScore,
    setGameState,
    setFinalResult
  } = useGameStore()

  const [question, setQuestion] = useState(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(5)
  const [timeLeft, setTimeLeft] = useState(10)
  const [selectedOption, setSelectedOption] = useState(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    if (!matchId || !user) {
      router.push('/dashboard')
      return
    }

    function onNewQuestion(data) {
      setQuestion(data.question)
      setQuestionIndex(data.index)
      setTotalQuestions(data.total)
      setTimeLeft(10)
      setSelectedOption(null)
      setIsAnswered(false)
      setResult(null)
    }

    function onQuestionResult(data) {
      setResult(data)
      Object.entries(data.scores).forEach(([id, score]) => {
        updateScore(id, score)
      })
    }

    function onGameOver(data) {
      setFinalResult({
        scores: data?.scores || scores,
        winnerId: data?.winnerId ?? null,
      })
      setGameState('results')
      router.push('/results')
    }

    function onOpponentDisconnected() {
      alert('Opponent disconnected!')
      router.push('/dashboard')
    }

    socket.on('new_question', onNewQuestion)
    socket.on('question_result', onQuestionResult)
    socket.on('game_over', onGameOver)
    socket.on('opponent_disconnected', onOpponentDisconnected)

    return () => {
      socket.off('new_question', onNewQuestion)
      socket.off('question_result', onQuestionResult)
      socket.off('game_over', onGameOver)
      socket.off('opponent_disconnected', onOpponentDisconnected)
    }
  }, [matchId, user, router, scores, updateScore, setFinalResult, setGameState])

  useEffect(() => {
    if (timeLeft > 0 && !result && question) {
      const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000)
      return () => clearInterval(timer)
    }
  }, [timeLeft, result, question])

  const handleAnswer = (index) => {
    if (isAnswered) return
    setSelectedOption(index)
    setIsAnswered(true)
    socket.emit('submit_answer', { matchId, answerIndex: index })
  }

  const myScore = scores[socket.id] || 0
  const opponentScore = Object.entries(scores).find(([id]) => id !== socket.id)?.[1] || 0
  const progress = totalQuestions > 0 ? ((questionIndex || 1) / totalQuestions) * 100 : 0
  const tone = timeLeft <= 3 ? 'danger' : 'primary'

  const scoreDeltaLabel = useMemo(() => {
    if (!result) return null
    return selectedOption === result.correctIndex
      ? `Correct! +${result.answers[socket.id]?.score || 0} pts`
      : 'Wrong answer'
  }, [result, selectedOption])

  if (!question) {
    return (
      <main className="arena-shell flex min-h-screen items-center justify-center px-6">
        <ArenaCard className="relative z-10 w-full max-w-md p-10 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
            <span className="font-display text-2xl font-black">VS</span>
          </div>
          <h2 className="font-display text-3xl font-black uppercase tracking-[-0.08em] text-foreground">
            Match starting
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Locking in both players and loading the opening question.
          </p>
        </ArenaCard>
      </main>
    )
  }

  return (
    <main className="arena-shell relative min-h-screen overflow-hidden px-4 py-6 md:px-8">
      <div className="absolute left-0 top-0 h-full w-1.5 bg-white/5">
        <motion.div
          className="absolute bottom-0 left-0 w-full bg-primary"
          animate={{ height: `${(myScore / Math.max(totalQuestions, 1)) * 100}%` }}
          transition={{ duration: 0.25 }}
        />
      </div>
      <div className="absolute right-0 top-0 h-full w-1.5 bg-white/5">
        <motion.div
          className="absolute bottom-0 left-0 w-full bg-destructive"
          animate={{ height: `${(opponentScore / Math.max(totalQuestions, 1)) * 100}%` }}
          transition={{ duration: 0.25 }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl">
        <header className="mb-8 flex items-center justify-between gap-4">
          <div className="text-center">
            <div className="font-display text-3xl font-black text-primary neon-text">{myScore}</div>
            <div className="metadata-label text-[10px]">{user?.name || 'You'}</div>
          </div>
          <div className="text-center">
            <div className="metadata-label">Question</div>
            <div className="font-display text-xl font-black text-foreground">
              {questionIndex}/{totalQuestions}
            </div>
          </div>
          <div className="text-center">
            <div className="font-display text-3xl font-black text-destructive">{opponentScore}</div>
            <div className="metadata-label text-[10px]">{opponent?.name || 'Opponent'}</div>
          </div>
        </header>

        <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-white/5">
          <motion.div
            className="h-full rounded-full bg-primary"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.25 }}
          />
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[0.32fr_0.68fr]">
          <ArenaCard className="p-6 text-center">
            <div className="mb-6">
              <div className="metadata-label">Round Timer</div>
            </div>
            <div className="flex justify-center">
              <CountdownRing value={timeLeft} max={10} tone={tone} />
            </div>
            <p className="mt-5 text-sm text-muted-foreground">
              Answer before the clock expires to stay ahead on the arena rails.
            </p>
          </ArenaCard>

          <div className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${questionIndex}-${question.question}`}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.25 }}
              >
                <ArenaCard glow className="p-8 md:p-10">
                  <div className="mb-3 metadata-label">Live Question</div>
                  <h1 className="text-center text-2xl font-semibold leading-tight text-foreground md:text-4xl">
                    {question.question}
                  </h1>
                </ArenaCard>
              </motion.div>
            </AnimatePresence>

            <div className="grid gap-4 md:grid-cols-2">
              {question.options.map((option, idx) => {
                let stateClass = 'hover:-translate-y-0.5 hover:border-white/15'

                if (isAnswered) {
                  if (result) {
                    if (idx === result.correctIndex) stateClass = 'answer-correct'
                    else if (idx === selectedOption) stateClass = 'answer-wrong'
                    else stateClass = 'opacity-45'
                  } else if (idx === selectedOption) {
                    stateClass = 'border-primary/50 bg-primary/10'
                  } else {
                    stateClass = 'opacity-45'
                  }
                }

                return (
                  <motion.button
                    key={`${questionIndex}-${idx}`}
                    whileHover={isAnswered ? {} : { scale: 1.01 }}
                    whileTap={isAnswered ? {} : { scale: 0.99 }}
                    onClick={() => handleAnswer(idx)}
                    disabled={isAnswered}
                    className={`arena-card min-h-28 p-6 text-left text-base text-foreground transition ${stateClass}`}
                  >
                    <span className="font-display mr-2 text-sm font-black text-primary">{String.fromCharCode(65 + idx)}.</span>
                    <span>{option}</span>
                  </motion.button>
                )
              })}
            </div>

            {result ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center"
              >
                <ArenaCard className="inline-flex items-center gap-3 px-6 py-4">
                  {selectedOption === result.correctIndex ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                  <span className={`font-display text-sm font-black uppercase tracking-[0.12em] ${
                    selectedOption === result.correctIndex ? 'text-primary' : 'text-destructive'
                  }`}>
                    {scoreDeltaLabel}
                  </span>
                </ArenaCard>
              </motion.div>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  )
}
