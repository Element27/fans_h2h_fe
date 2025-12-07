'use client'
import { useEffect, useState } from 'react'
import { getSupabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Users } from 'lucide-react'

export default function Login() {
  // hook (useState)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const router = useRouter()

  // hook (useEffect)
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

    console.log('redirectUrl', redirectUrl)
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

  const handleGuestPlay = () => {
    router.push('/guest-setup')
  }

  // JSX xml/xhtml/html 
  // java xml
  // js html  jsx

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 p-8 rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Login to fan_h2h</h2>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-lg focus:ring-2 focus:ring-emerald-500/50 focus:outline-none text-white placeholder-slate-500"
              placeholder="you@example.com"
            />
          </div>

          {message && (
            <div className={`p-4 rounded-lg text-sm ${message.type === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 text-white font-bold rounded-lg transition-all shadow-lg shadow-emerald-500/20"
          >
            {loading ? 'Sending Link...' : 'Send Magic Link'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700/50"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-slate-800/40 text-slate-500 font-medium">OR</span>
          </div>
        </div>

        <button
          onClick={handleGuestPlay}
          className="w-full py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 hover:border-purple-500/50 text-white font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-purple-500/10 flex items-center justify-center gap-2"
        >
          <Users className="w-5 h-5" />
          Play as Guest
        </button>

        <div className="mt-6 text-center">
          <Link href="/" className="text-slate-400 hover:text-white text-sm">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

