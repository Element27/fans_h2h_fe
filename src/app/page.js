import Link from 'next/link'
import { Shield, Trophy, Zap } from 'lucide-react'

const stats = [
  { label: 'ACTIVE', value: '12.4K' },
  { label: 'MATCHES', value: '890K' },
  { label: 'CLUBS', value: '120+' },
]

export default function Home() {
  return (
    <main className="arena-shell flex min-h-screen items-center justify-center px-6 py-16">
      <div className="relative z-10 mx-auto w-full max-w-5xl">
        <div className="grid gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
          <section className="space-y-8">
            <div className="space-y-4">
              <p className="metadata-label">Football Trivia Arena</p>
              <h1 className="font-display max-w-3xl text-5xl font-black uppercase tracking-[-0.1em] text-foreground md:text-7xl">
                Prove your loyalty in live fan battles.
              </h1>
              <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
                Challenge rival supporters in rapid-fire football trivia duels, build your reputation,
                and carry your club into every head-to-head matchup.
              </p>
            </div>

            <div className="flex max-w-md flex-col gap-4">
              <Link href="/club-selection?guest=1" className="arena-button arena-button-primary">
                <Zap className="h-4 w-4" />
                Play as Guest
              </Link>
              <Link href="/login" className="arena-button arena-button-secondary">
                <Shield className="h-4 w-4" />
                Register / Login
              </Link>
            </div>

            <div className="grid max-w-lg grid-cols-3 gap-4 pt-4">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 text-center backdrop-blur-sm">
                  <div className="font-display text-2xl font-black text-foreground">{stat.value}</div>
                  <div className="metadata-label mt-1 text-[10px]">{stat.label}</div>
                </div>
              ))}
            </div>
          </section>

          <aside className="arena-card arena-card-glow relative overflow-hidden p-8 lg:p-10">
            <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top,rgba(190,242,100,0.16),transparent_65%)]" />
            <div className="relative space-y-6">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Trophy className="h-7 w-7" />
              </div>
              <div className="space-y-3">
                <p className="metadata-label">Arena Format</p>
                <h2 className="font-display text-3xl font-black uppercase tracking-[-0.08em] text-foreground">
                  1v1. Live. No hiding.
                </h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  Match with a random rival or open a private room, answer under pressure, and let
                  the scoreboard decide who owns the bragging rights.
                </p>
              </div>
              <div className="space-y-3">
                {[
                  'Real-time matchmaking with private room support',
                  'Club identity carried across profile and match screens',
                  'Quick result loops for repeat sessions and rankings',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-foreground">
                    <span className="mt-1 h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(190,242,100,0.7)]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
