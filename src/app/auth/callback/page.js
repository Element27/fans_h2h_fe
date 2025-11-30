'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/supabaseClient'

export default function AuthCallback() {
  const router = useRouter()

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

  useEffect(() => {
    const { data: { subscription } } = getSupabase().auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        checkUserClub(session.user.id)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, checkUserClub])

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
    </div>
  )
}
