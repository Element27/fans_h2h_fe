import { createClient } from '@supabase/supabase-js'

let client
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
console.log("keys", url, key)

export const getSupabase = () => {
  if (!client) {
    if (!url || !key) {
      throw new Error('Missing Supabase Environment Variables. Check your .env.local file.')
    }
    client = createClient(url, key)
  }
  return client
}
