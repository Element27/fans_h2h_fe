import { Copy, Play, Share2, Users } from 'lucide-react'
import React from 'react'

export default function IdleStatus({ handleFindMatch, handleCreatePrivate, inviteLink, handleJoinPrivate, joinCode, setJoinCode, error, setError, handleCancelWait }) {
  return (
    <div className="space-y-6 max-w-md mx-auto">
      <button
        onClick={handleFindMatch}
        className="w-full py-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-2xl rounded-2xl shadow-lg shadow-emerald-500/20 transition-all transform hover:scale-105 flex items-center justify-center gap-3"
      >
        <Play className="w-8 h-8" />
        Find Match
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-slate-900 text-slate-500">OR</span>
        </div>
      </div>

      <div className="bg-slate-800 p-6 rounded-xl space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-bold mb-2 flex items-center justify-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            Play with Friend
          </h3>
        </div>

        {!inviteLink ? (
          <button
            onClick={handleCreatePrivate}
            className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
          >
            Create Private Room
          </button>
        ) : (
          <div className="bg-slate-900 p-4 rounded-lg text-center">
            <p className="text-sm text-slate-400 mb-2">Share this code or link:</p>
            <div className="text-3xl font-mono font-bold text-emerald-400 tracking-widest mb-2">
              {inviteLink}
            </div>
            <div className="text-xs text-slate-500 mb-3 break-all">
              {typeof window !== 'undefined' && `${window.location.origin}/dashboard?room=${inviteLink}`}
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(`${window.location.origin}/dashboard?room=${inviteLink}`)}
              className="mr-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <Copy className="w-4 h-4" /> Copy Link
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(inviteLink)}
              className="mr-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <Copy className="w-4 h-4" /> Copy Code
            </button>
            {typeof window !== 'undefined' && navigator.share && (
              <button
                onClick={() => navigator.share({
                  title: 'fan_h2h Private Room',
                  text: 'Join my private match',
                  url: `${window.location.origin}/dashboard?room=${inviteLink}`
                }).catch(() => { })}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" /> Share
              </button>
            )}
            <button
              onClick={handleCancelWait}
              className="mt-2 px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        <form onSubmit={handleJoinPrivate} className="pt-4 border-t border-slate-700">
          <label className="block text-sm text-slate-400 mb-2">Have a code?</label>
          <div className="flex gap-2 flex-wrap">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="ENTER CODE"
              className="flex-1 px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono text-center uppercase"
            />
            <button
              type="submit"
              disabled={!joinCode}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-lg transition-colors"
            >
              Join
            </button>
          </div>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </form>
      </div>
    </div>
  )
}
