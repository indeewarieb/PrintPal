import { supabase, isSupabaseConfigured } from '../supabaseClient.js'

// Verifies the Authorization: Bearer <token> against Supabase Auth, then
// checks the corresponding profiles.role is 'admin'. The service-role
// client can validate any user's token for this project, so no extra
// secret is needed beyond SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.
export async function requireAdmin(req, res, next) {
  if (!isSupabaseConfigured) {
    console.error(
      '[auth] Rejecting admin request — SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set ' +
        'in visions-api/.env.'
    )
    return res.status(500).json({
      error:
        'The API is not connected to Supabase yet. Set SUPABASE_URL and ' +
        'SUPABASE_SERVICE_ROLE_KEY in visions-api/.env and restart the server.',
    })
  }

  const authHeader = req.get('authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return res.status(401).json({ error: 'Sign in required.' })
  }

  let userData
  let userError
  try {
    ;({ data: userData, error: userError } = await supabase.auth.getUser(token))
  } catch (err) {
    // The request to Supabase itself failed (network error, wrong
    // SUPABASE_URL, project unreachable, etc.) — this is a server
    // configuration problem, not the user's session being invalid, so
    // say so instead of telling them to log in again.
    console.error('[auth] Could not reach Supabase to verify the token:', err.message)
    return res.status(502).json({
      error:
        'Could not reach Supabase to verify your session. Check SUPABASE_URL in ' +
        "visions-api/.env and the server's network connection.",
    })
  }

  if (userError || !userData?.user) {
    // A genuinely expired/invalid token lands here — but so does a token
    // issued by a *different* Supabase project than this API is
    // configured with (e.g. VITE_SUPABASE_URL on the frontend doesn't
    // match SUPABASE_URL here). Log the real reason so that's easy to
    // tell apart from actual expiry when checking server logs.
    console.error(
      '[auth] Supabase rejected the token:',
      userError?.message ?? 'no user returned for this token'
    )
    return res.status(401).json({ error: 'Your session has expired. Please sign in again.' })
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .maybeSingle()

  if (profileError) {
    console.error('[auth]', profileError.message)
    return res.status(500).json({ error: profileError.message })
  }

  if (!profile || profile.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' })
  }

  req.user = userData.user
  next()
}
