import { create } from 'zustand'

const useGameStore = create((set) => ({
  matchId: null,
  players: {}, // { socketId: { user, score } }
  questions: [],
  currentQuestionIndex: 0,
  scores: {}, // { socketId: score }
  timer: 10,
  gameState: 'idle', // idle, matchmaking, playing, results
  opponent: null,

  setMatchId: (id) => set({ matchId: id }),
  setGameState: (state) => set({ gameState: state }),
  setQuestions: (questions) => set({ questions }),
  setOpponent: (opponent) => set({ opponent }),

  updateScore: (playerId, score) => set((state) => ({
    scores: { ...state.scores, [playerId]: score }
  })),

  setTimer: (time) => set({ timer: time }),

  resetGame: () => set({
    matchId: null,
    questions: [],
    currentQuestionIndex: 0,
    scores: {},
    gameState: 'idle',
    opponent: null,
    timer: 10
  })
}))

export default useGameStore
