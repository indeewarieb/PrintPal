import { AlertTriangle } from 'lucide-react'

export default function SupabaseConfigNotice() {
  return (
    <div className="auth-page__notice">
      <AlertTriangle size={16} strokeWidth={2} />
      <span>
        Supabase isn&rsquo;t configured yet. Set <code>VITE_SUPABASE_URL</code> and{' '}
        <code>VITE_SUPABASE_ANON_KEY</code> in <code>visions-app/.env</code> (see the README),
        then restart the dev server.
      </span>
    </div>
  )
}
