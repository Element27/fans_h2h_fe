import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 no-scrollbar">
      <div className="max-w-md w-full text-center space-y-8">
        <h1 className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
          fan_h2h
        </h1>
        <p className="text-xl text-slate-400">
          The ultimate head-to-head football quiz. Represent your club.
        </p>

        <div className="space-y-4">
          <Link
            href="/login"
            className="block w-full py-4 px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-emerald-500/20"
          >
            Play Now
          </Link>

          <div className="flex justify-center gap-4 text-sm text-slate-500">
            <span>⚡ Real-time</span>
            <span>🏆 Leaderboards</span>
            <span>⚽ Global Clubs</span>
          </div>
        </div>
      </div>
    </div>
  )
}
