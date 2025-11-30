'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { socket } from '@/lib/socket'
import useUserStore from '@/stores/useUserStore'
import useGameStore from '@/stores/useGameStore'
import { Timer, CheckCircle, XCircle } from 'lucide-react'

export default function Match() {
  const router = useRouter()
  const user = useUserStore((state) => state.user)
  const {
    matchId,
    opponent,
    scores,
    updateScore,
    setGameState
  } = useGameStore()

  const [question, setQuestion] = useState(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(5)
  const [timeLeft, setTimeLeft] = useState(10)
  const [selectedOption, setSelectedOption] = useState(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [result, setResult] = useState(null) // { correctIndex, scores, answers }

  useEffect(() => {
    if (!matchId || !user) {
      router.push('/dashboard')
      return
    }

    // Listeners
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
      // Update local store scores
      Object.entries(data.scores).forEach(([id, score]) => {
        updateScore(id, score)
      })
    }

    function onGameOver(data) {
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
  }, [matchId, user, router, updateScore, setGameState])

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !result && question) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000)
      return () => clearInterval(timer)
    }
  }, [timeLeft, result, question])

  const handleAnswer = (index) => {
    if (isAnswered) return
    setSelectedOption(index)
    setIsAnswered(true)
    socket.emit('submit_answer', { matchId, answerIndex: index })
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center animate-pulse">
          <h2 className="text-2xl font-bold text-emerald-400">Get Ready!</h2>
          <p className="text-slate-400">Match starting soon...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      {/* Header / Scoreboard */}
      <div className="max-w-4xl mx-auto mb-8 bg-slate-800 rounded-xl p-4 flex justify-between items-center shadow-lg">
        <div className="text-center w-1/3">
          <p className="font-bold text-lg text-emerald-400">{user.name}</p>
          <p className="text-3xl font-black">{scores[socket.id] || 0}</p>
        </div>

        <div className="text-center w-1/3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-700 border-4 border-slate-600">
            <span className={`text-2xl font-bold ${timeLeft <= 3 ? 'text-red-500' : 'text-white'}`}>
              {timeLeft}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Q {questionIndex} / {totalQuestions}</p>
        </div>

        <div className="text-center w-1/3">
          <p className="font-bold text-lg text-red-400">{opponent?.name || 'Opponent'}</p>
          <p className="text-3xl font-black">
            {Object.entries(scores).find(([id]) => id !== socket.id)?.[1] || 0}
          </p>
        </div>
      </div>

      {/* Question Area */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-slate-800 p-8 rounded-2xl shadow-xl mb-6 text-center min-h-[200px] flex items-center justify-center">
          <h2 className="text-2xl md:text-3xl font-bold leading-tight">
            {question.question}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {question.options.map((option, idx) => {
            let statusClass = 'bg-slate-700 hover:bg-slate-600'

            if (isAnswered) {
              if (result) {
                if (idx === result.correctIndex) statusClass = 'bg-emerald-600 ring-2 ring-emerald-400'
                else if (idx === selectedOption) statusClass = 'bg-red-600 ring-2 ring-red-400'
                else statusClass = 'bg-slate-700 opacity-50'
              } else {
                if (idx === selectedOption) statusClass = 'bg-blue-600 ring-2 ring-blue-400'
                else statusClass = 'bg-slate-700 opacity-50'
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={isAnswered}
                className={`p-6 rounded-xl text-lg font-semibold transition-all transform ${statusClass} ${!isAnswered && 'hover:scale-105 shadow-lg'}`}
              >
                {option}
              </button>
            )
          })}
        </div>

        {/* Result Feedback */}
        {result && (
          <div className="mt-8 text-center animate-bounce">
            {selectedOption === result.correctIndex ? (
              <div className="inline-flex items-center gap-2 text-emerald-400 text-xl font-bold">
                <CheckCircle /> Correct! +{result.answers[socket.id]?.score} pts
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 text-red-400 text-xl font-bold">
                <XCircle /> Wrong!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
