import { Search } from 'lucide-react'
import React from 'react'

export default function SearchingStatus({ handleCancelWait }) {
  return (

    <div className="bg-slate-800 p-8 rounded-2xl text-center">
      <Search className="w-12 h-12 mx-auto text-emerald-400 mb-4 animate-pulse" />
      <h2 className="text-2xl font-bold mb-2">Searching for opponent...</h2>
      <p className="text-slate-400 mb-4">Matching you with a random fan</p>
      <button
        onClick={handleCancelWait}
        className="mt-2 px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
      >
        Cancel
      </button>
    </div>
  )
}
