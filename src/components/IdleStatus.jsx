import { Copy, Play, Share2, Users } from 'lucide-react'
import React from 'react'

export default function IdleStatus({ handleFindMatch, handleCreatePrivate, inviteLink, handleJoinPrivate, joinCode, setJoinCode, error, setError, handleCancelWait }) {
  return (
    <div className="space-y-5 max-w-lg mx-auto">
      <button
        onClick={handleFindMatch}
        className="group w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
      >
        <Play className="w-6 h-6 group-hover:scale-110 transition-transform" />
        Find Match
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-700/50"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 bg-slate-800/40 text-slate-500 font-medium">OR</span>
        </div>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 p-5 rounded-xl space-y-5">
        <div className="text-center">
          <h3 className="text-base font-semibold mb-1 flex items-center justify-center gap-2 text-slate-200">
            <Users className="w-5 h-5 text-purple-400" />
            Play with Friend
          </h3>
          <p className="text-xs text-slate-500">Create or join a private room</p>
        </div>

        {!inviteLink ? (
          <button
            onClick={handleCreatePrivate}
            className="w-full py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 hover:border-purple-500/50 text-white font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-purple-500/10"
          >
            🎲 Create Private Room
          </button>
        ) : (
          <div className="bg-slate-950/50 border border-slate-700/30 p-4 rounded-lg space-y-3">
            <p className="text-xs text-slate-400 text-center">Share this code or link:</p>
            <div className="text-2xl font-mono font-bold text-emerald-400 tracking-widest text-center py-2 bg-slate-900/50 rounded-lg border border-emerald-500/20">
              {inviteLink}
            </div>
            <div className="text-xs text-slate-500 text-center break-all px-2">
              {typeof window !== 'undefined' && `${window.location.origin}/dashboard?room=${inviteLink}`}
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => navigator.clipboard.writeText(`${window.location.origin}/dashboard?room=${inviteLink}`)}
                className="px-3 py-2 bg-slate-700/50 hover:bg-slate-600 border border-slate-600/50 text-white text-sm font-medium rounded-lg transition-all inline-flex items-center gap-2"
              >
                <Copy className="w-3.5 h-3.5" /> Copy Link
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(inviteLink)}
                className="px-3 py-2 bg-slate-700/50 hover:bg-slate-600 border border-slate-600/50 text-white text-sm font-medium rounded-lg transition-all inline-flex items-center gap-2"
              >
                <Copy className="w-3.5 h-3.5" /> Copy Code
              </button>
              {typeof window !== 'undefined' && navigator.share && (
                <button
                  onClick={() => navigator.share({
                    title: 'fan_h2h Private Room',
                    text: 'Join my private match',
                    url: `${window.location.origin}/dashboard?room=${inviteLink}`
                  }).catch(() => { })}
                  className="px-3 py-2 bg-slate-700/50 hover:bg-slate-600 border border-slate-600/50 text-white text-sm font-medium rounded-lg transition-all inline-flex items-center gap-2"
                >
                  <Share2 className="w-3.5 h-3.5" /> Share
                </button>
              )}
            </div>
            <button
              onClick={handleCancelWait}
              className="w-full mt-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600 border border-slate-600/50 text-white text-sm font-medium rounded-lg transition-all"
            >
              Cancel
            </button>
          </div>
        )}

        <form onSubmit={handleJoinPrivate} className="pt-4 border-t border-slate-700/50 space-y-3">
          <label className="block text-xs text-slate-400 font-medium">Have a code?</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="ENTER CODE"
              maxLength={6}
              className="flex-1 px-4 py-2.5 bg-slate-950/50 border border-slate-600/50 rounded-lg focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 focus:outline-none font-mono text-center uppercase text-sm transition-all"
            />
            <button
              type="submit"
              disabled={!joinCode}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all shadow-lg shadow-purple-500/20 text-sm"
            >
              Join
            </button>
          </div>
          {error && <p className="text-red-400 text-xs mt-2 text-center">{error}</p>}
        </form>
      </div>
    </div>
  )
}
