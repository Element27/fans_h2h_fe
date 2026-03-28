'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/supabaseClient'
import ArenaCard from '@/components/ui/ArenaCard'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const checkUserClub = async (userId) => {
      const { data, error } = await getSupabase()
        .from('users')
        .select('club')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user:', error)
        return
      }

      if (data?.club) {
        router.push('/dashboard')
      } else {
        router.push('/club-selection')
      }
    }

    const { data: { subscription } } = getSupabase().auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        checkUserClub(session.user.id)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  return (
    <main className="arena-shell flex min-h-screen items-center justify-center px-6">
      <ArenaCard className="relative z-10 w-full max-w-md p-10 text-center">
        <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary" />
        <h1 className="font-display text-3xl font-black uppercase tracking-[-0.08em] text-foreground">
          Verifying login
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Restoring your session and routing you into the arena.
        </p>
      </ArenaCard>
    </main>
  )
}
