import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// True only when both env vars are set to something other than the
// placeholder values below. Every auth call checks this first so the
// UI can show a clear "Supabase isn't configured" message instead of a
// bare "Failed to fetch" (which is what a request to the placeholder
// URL looks like — it doesn't exist, so the browser's fetch just fails).
export const isSupabaseConfigured = Boolean(url && anonKey)

if (!isSupabaseConfigured) {
  console.warn(
    '[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set. ' +
      'Copy .env.example to .env, fill in your project credentials, and ' +
      'restart the dev server — login/register will not work until you do.'
  )
}

// The anon key is designed to be public/client-side — Row Level Security
// on the Supabase side is what actually protects data, not secrecy of
// this key. Never put the service_role key here.
export const supabase = createClient(
  url ?? 'https://placeholder.supabase.co',
  anonKey ?? 'placeholder-anon-key'
)
