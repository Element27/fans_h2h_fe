import useUserStore from '@/stores/useUserStore'
import React from 'react'

export default function TopBar() {
  const user = useUserStore((state) => state.user)
  const club = useUserStore((state) => state.club)
  const logoutStore = useUserStore((state) => state.logout)


  const handleLogout = async () => {
    try {
      await getSupabase().auth.signOut()
    } catch { }
    socket.disconnect()
    resetGame()
    logoutStore()
    router.push('/login')
  }
  return (
    <header className="flex justify-between items-center max-w-4xl mx-auto py-6">
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
    </header>
  )
}
