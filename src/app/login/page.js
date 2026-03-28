'use client'

import { useEffect, useState } from 'react'
import { getSupabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Shield } from 'lucide-react'
import { motion } from 'framer-motion'
import ScreenHeader from '@/components/ui/ScreenHeader'
import ArenaCard from '@/components/ui/ArenaCard'
import { PrimaryButton, SecondaryButton } from '@/components/ui/ActionButton'

export default function Login() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const run = async () => {
      const { data: { session } } = await getSupabase().auth.getSession()
      if (session) {
        const { data, error } = await getSupabase()
          .from('users')
          .select('club')
          .eq('id', session.user.id)
          .single()
        if (!error && data?.club) {
          router.push('/dashboard')
        } else {
          router.push('/club-selection')
        }
      }
    }
    run()
  }, [router])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const redirectUrl = `${origin}/auth/callback`

    const { error } = await getSupabase().auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    })

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Check your email for the login link!' })
    }
    setLoading(false)
  }

  return (
    <main className="arena-shell flex min-h-screen items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-5xl"
      >
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex flex-col justify-between gap-8">
            <div className="space-y-6">
              <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                <span className="metadata-label">Back</span>
              </Link>
              <ScreenHeader
                eyebrow="Authentication"
                title="Enter the arena."
                subtitle="Use your email to get a magic login link, then finish your profile and join the live match queue."
              />
            </div>

            <ArenaCard className="hidden p-6 lg:block">
              <div className="space-y-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-display text-xl font-black uppercase tracking-[-0.08em] text-foreground">
                    Secure fan access
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    The current Supabase magic-link flow stays intact, so this screen is a UI upgrade
                    without changing authentication behavior.
                  </p>
                </div>
              </div>
            </ArenaCard>
          </div>

          <ArenaCard glow className="p-8 md:p-10">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="metadata-label">Email Address</label>
                <div className="arena-card flex items-center gap-3 rounded-2xl px-4 py-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {message ? (
                <div className={`rounded-2xl border px-4 py-3 text-sm ${
                  message.type === 'error'
                    ? 'border-red-500/30 bg-red-500/10 text-red-300'
                    : 'border-primary/30 bg-primary/10 text-primary'
                }`}>
                  {message.text}
                </div>
              ) : null}

              <PrimaryButton type="submit" disabled={loading} className="w-full">
                {loading ? 'Sending Link...' : 'Send Magic Link'}
              </PrimaryButton>

              <SecondaryButton type="button" className="w-full" onClick={() => router.push('/')}>
                Return Home
              </SecondaryButton>
            </form>
          </ArenaCard>
        </div>
      </motion.div>
    </main>
  )
}
