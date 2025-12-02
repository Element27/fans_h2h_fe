import React from 'react'

export default function HowToPlay() {
  return (
    <div className="h-screen bg-slate-900 text-white p-4 overflow-scroll no-scrollbar">
      <div className="w-full mx-auto space-y-8 ">
        <div className="text-center">
          <h1 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">How to Play</h1>
          <p className="text-slate-400 mt-2">Head-to-head football quiz. Represent your club.</p>
        </div>

        <section className="bg-slate-800 rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
          <ul className="list-disc list-inside space-y-2 text-slate-300">
            <li>Login with your email.</li>
            <li>Set a display name and choose your club.</li>
            <li>Find Match to play instantly or Create Private Room to invite a friend.</li>
            <li>Use the generated code or link to join private matches.</li>
          </ul>
        </section>

        <section className="bg-slate-800 rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-4">Match Rules</h2>
          <ul className="list-disc list-inside space-y-2 text-slate-300">
            <li>Each match has 10 questions.</li>
            <li>Questions are tailored: 5 from each player’s selected club when available.</li>
            <li>You have 10 seconds to answer each question.</li>
            <li>A short break occurs between questions.</li>
            <li>No negative points for wrong answers.</li>
            <li>If an opponent disconnects, the match ends.</li>
          </ul>
        </section>

        <section className="bg-slate-800 rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-4">Scoring</h2>
          <ul className="list-disc list-inside space-y-2 text-slate-300">
            <li>Correct answer: 100 points base.</li>
            <li>Time bonus: up to 50 extra points based on remaining time.</li>
            <li>Wrong answer: 0 points.</li>
            <li>Total score is the sum across all questions.</li>
            <li>Winner is the player with the higher total; equal totals result in a draw.</li>
          </ul>
        </section>

        <section className="bg-slate-800 rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-4">Private Rooms</h2>
          <ul className="list-disc list-inside space-y-2 text-slate-300">
            <li>Creating a room generates a 6-character code and a shareable link.</li>
            <li>Share the link to let friends join directly.</li>
            <li>Players can also enter the code on the dashboard to join.</li>
          </ul>
        </section>

      </div>
    </div>
  )
}
