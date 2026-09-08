import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)

if (!isSupabaseConfigured) {
  console.warn(
    '[supabase] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set. ' +
      'Copy .env.example to .env and fill in your project credentials — ' +
      'the API will start, but every request will fail until you do.'
  )
}

// The service role key is used because this client only ever runs on the
// server. It bypasses Row Level Security, so it must never be sent to
// the browser — the frontend only ever talks to *this* API, never to
// Supabase directly.
export const supabase = createClient(
  SUPABASE_URL ?? 'https://placeholder.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY ?? 'placeholder-key',
  {
    auth: { persistSession: false },
  }
)

export const CATEGORY_IMAGES_TABLE = 'category_images'
export const CATEGORY_IMAGES_BUCKET = 'category-images'
export const ITEMS_TABLE = 'items'
export const ITEMS_BUCKET = 'item-images'
