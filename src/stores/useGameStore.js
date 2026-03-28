import { create } from 'zustand'

const useGameStore = create((set) => ({
  matchId: null,
  players: {}, // { socketId: { user, score } }
  questions: [],
  currentQuestionIndex: 0,
  scores: {}, // { socketId: score }
  finalScores: null,
  winnerId: null,
  timer: 10,
  gameState: 'idle', // idle, matchmaking, playing, results
  opponent: null,

  setMatchId: (id) => set({ matchId: id }),
  setGameState: (state) => set({ gameState: state }),
  setQuestions: (questions) => set({ questions }),
  setOpponent: (opponent) => set({ opponent }),
  setScores: (scores) => set({ scores }),
  setFinalResult: ({ scores, winnerId }) => set({
    scores,
    finalScores: scores,
    winnerId: winnerId ?? null,
  }),

  updateScore: (playerId, score) => set((state) => ({
    scores: { ...state.scores, [playerId]: score }
  })),

  setTimer: (time) => set({ timer: time }),

  resetGame: () => set({
    matchId: null,
    questions: [],
    currentQuestionIndex: 0,
    scores: {},
    finalScores: null,
    winnerId: null,
    gameState: 'idle',
    opponent: null,
    timer: 10
  })
}))

export default useGameStore
