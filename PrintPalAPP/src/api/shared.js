import { supabase } from '../lib/supabaseClient.js'

export const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

export async function parseJsonOrThrow(res) {
  let body = null
  try {
    body = await res.json()
  } catch {
    // Response had no JSON body (e.g. a 204) — nothing to parse.
  }
  if (!res.ok) {
    throw new Error(body?.error || `Request failed with ${res.status}`)
  }
  return body
}

// A bare `TypeError: Failed to fetch` means the request never reached
// the server at all — almost always because visions-api isn't running,
// or VITE_API_URL points somewhere wrong. Wrap every admin call so that
// shows up as an actionable message instead of the raw browser error.
export async function withFriendlyNetworkError(fn) {
  try {
    return await fn()
  } catch (err) {
    if (err instanceof TypeError && /fetch/i.test(err.message)) {
      throw new Error(
        `Could not reach the API at ${API_BASE}. Make sure visions-api is running ` +
          '(npm run dev in that folder) and VITE_API_URL points to it.'
      )
    }
    throw err
  }
}

// Always read the token straight from Supabase right before the request,
// rather than trusting one threaded in through component state/props —
// supabase-js keeps the session refreshed in the background, so this is
// the one place guaranteed to have the current, valid access token
// instead of a possibly-stale one, which is what caused "Your session
// has expired" errors on otherwise-valid sessions.
export async function getFreshAccessToken() {
  const { data, error } = await supabase.auth.getSession()
  if (error || !data.session) {
    throw new Error('You are not signed in. Please log in again.')
  }
  return data.session.access_token
}
