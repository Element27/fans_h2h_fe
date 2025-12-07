import useUserStore from '@/stores/useUserStore'
import useGameStore from '@/stores/useGameStore'
import { getSupabase } from '@/lib/supabaseClient'
import { socket } from '@/lib/socket'
import { useRouter } from 'next/navigation'
import React from 'react'

export default function TopBar() {
  const user = useUserStore((state) => state.user)
  const club = useUserStore((state) => state.club)
  const isGuest = useUserStore((state) => state.isGuest)
  const logoutStore = useUserStore((state) => state.logout)
  const resetGame = useGameStore((state) => state.resetGame)
  const router = useRouter()

  const handleLogout = async () => {
    try {
      // Only sign out from Supabase if not a guest
      if (!isGuest) {
        await getSupabase().auth.signOut()
      }
    } catch (error) {
      console.error('Logout error:', error)
    }
    
    // Disconnect socket and reset game state
    if (socket.connected) {
      socket.disconnect()
    }
    resetGame()
    logoutStore()
    router.push('/login')
  }

  return (
    <header className="flex justify-between items-center max-w-7xl mx-auto py-6 px-4">
      <div className="flex items-center gap-3">
        <div className="text-3xl">⚽</div>
        <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400">
          fan_h2h
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl px-4 py-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-slate-900 font-bold text-sm">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="text-left hidden sm:block">
            <p className="font-semibold text-sm text-white">{user?.name}</p>
            <p className="text-xs text-slate-400">{club}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600 border border-slate-600/50 text-white rounded-lg text-sm font-medium transition-all"
        >
          Logout
        </button>
      </div>
    </header>
  )
}
