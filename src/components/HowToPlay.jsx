import React from 'react'
import { Rocket, Mail, User, Zap, Link2, Trophy, Target, Clock, Coffee, Heart, Unplug, BarChart3, CheckCircle, X, Calculator, Medal, Lock, Dices, Send, Hash } from 'lucide-react'

export default function HowToPlay() {
  const sections = [
    {
      icon: Rocket,
      title: 'Getting Started',
      gradient: 'from-emerald-500/20 to-teal-500/20',
      borderGradient: 'from-emerald-500 to-teal-500',
      items: [
        { icon: Mail, text: 'Login with your email' },
        { icon: User, text: 'Set a display name and choose your club' },
        { icon: Zap, text: 'Find Match to play instantly or Create Private Room to invite a friend' },
        { icon: Link2, text: 'Use the generated code or link to join private matches' }
      ]
    },
    {
      icon: Trophy,
      title: 'Match Rules',
      gradient: 'from-blue-500/20 to-cyan-500/20',
      borderGradient: 'from-blue-500 to-cyan-500',
      items: [
        { icon: Target, text: 'Each match has 10 questions' },
        { icon: Trophy, text: 'Questions are tailored: 5 from each player\'s selected club when available' },
        { icon: Clock, text: 'You have 10 seconds to answer each question' },
        { icon: Coffee, text: 'A short break occurs between questions' },
        { icon: Heart, text: 'No negative points for wrong answers' },
        { icon: Unplug, text: 'If an opponent disconnects, the match ends' }
      ]
    },
    {
      icon: BarChart3,
      title: 'Scoring',
      gradient: 'from-purple-500/20 to-pink-500/20',
      borderGradient: 'from-purple-500 to-pink-500',
      items: [
        { icon: CheckCircle, text: 'Correct answer: 100 points base' },
        { icon: Zap, text: 'Time bonus: up to 50 extra points based on remaining time' },
        { icon: X, text: 'Wrong answer: 0 points' },
        { icon: Calculator, text: 'Total score is the sum across all questions' },
        { icon: Medal, text: 'Winner is the player with the higher total; equal totals result in a draw' }
      ]
    },
    {
      icon: Lock,
      title: 'Private Rooms',
      gradient: 'from-orange-500/20 to-red-500/20',
      borderGradient: 'from-orange-500 to-red-500',
      items: [
        { icon: Dices, text: 'Creating a room generates a 6-character code and a shareable link' },
        { icon: Send, text: 'Share the link to let friends join directly' },
        { icon: Hash, text: 'Players can also enter the code on the dashboard to join' }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6 overflow-scroll no-scrollbar">
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div className="text-center space-y-4 pt-8">
          <div className="inline-block">
            <h1 className="text-5xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 animate-pulse">
              How to Play
            </h1>
            <div className="h-1 mt-2 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 rounded-full"></div>
          </div>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Head-to-head football quiz. Represent your club and prove your knowledge!
          </p>
        </div>

        {/* Sections */}
        <div className="grid gap-6">
          {sections.map((section, idx) => {
            const SectionIcon = section.icon
            return (
              <div
                key={idx}
                className="group relative bg-slate-800/50 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/50 hover:border-slate-600 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-900/50 hover:-translate-y-1"
              >
                {/* Gradient border effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${section.borderGradient} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-300`}></div>
                
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${section.gradient} opacity-50 rounded-3xl`}></div>
                
                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <SectionIcon className="w-8 h-8 text-white" strokeWidth={2} />
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                      {section.title}
                    </h2>
                  </div>
                  
                  <ul className="space-y-4">
                    {section.items.map((item, itemIdx) => {
                      const ItemIcon = item.icon
                      return (
                        <li
                          key={itemIdx}
                          className="flex items-start gap-3 text-slate-200 group/item hover:text-white transition-colors duration-200"
                        >
                          <ItemIcon className="w-5 h-5 mt-0.5 flex-shrink-0 group-hover/item:scale-110 transition-transform duration-200" strokeWidth={2} />
                          <span className="leading-relaxed text-sm">{item.text}</span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer CTA */}
        <div className="text-center pt-8">
          <div className="inline-block bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 backdrop-blur-sm border border-emerald-500/30 rounded-2xl px-8 py-6">
            <p className="text-emerald-400 font-semibold text-lg mb-2">Ready to play?</p>
            <p className="text-slate-400">Head back to the dashboard and start your first match!</p>
          </div>
        </div>
      </div>
    </div>
  )
}

