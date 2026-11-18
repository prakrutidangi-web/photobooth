'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient, supabaseConfigured } from '@/lib/supabase/client';
import { safeNext } from '@/lib/safe-redirect';

export default function LoginForm({ next, urlError }: { next: string; urlError: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<{ kind: 'err' | 'ok'; text: string } | null>(urlError ? { kind: 'err', text: 'Sign-in failed. Please try again.' } : null);
  const [loading, setLoading] = useState(false);
  const dest = safeNext(next);
  const googleOn = process.env.NEXT_PUBLIC_GOOGLE_ENABLED === 'true';

  if (!supabaseConfigured) return (
    <div className="error" role="alert"><strong>Login isn't configured yet.</strong>Copy <code>.env.local.example</code> to <code>.env.local</code> and add your Supabase URL and anon key (see README).</div>
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setMsg(null);
    if (password.length < 8) { setMsg({ kind: 'err', text: 'Password must be at least 8 characters.' }); return; }
    setLoading(true);
    const supabase = createClient();
    if (mode === 'in') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) { setMsg({ kind: 'err', text: 'Incorrect email or password.' }); return; }
      router.replace(dest); router.refresh();
    } else {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(dest)}` } });
      setLoading(false);
      if (error) { setMsg({ kind: 'err', text: 'Could not create the account. Try a stronger password or a different email.' }); return; }
      setMsg({ kind: 'ok', text: 'Check your email to confirm your account, then sign in.' });
    }
  }

  async function google() {
    setMsg(null);
    const { error } = await createClient().auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(dest)}` } });
    if (error) setMsg({ kind: 'err', text: 'Google sign-in is not available right now.' });
  }

  return (
    <>
      <div className="tabs" role="tablist">
        {(['in', 'up'] as const).map((m) => (
          <button key={m} role="tab" aria-selected={mode === m} className={mode === m ? 'on' : ''} onClick={() => { setMode(m); setMsg(null); }}>{m === 'in' ? 'Sign in' : 'Create account'}</button>
        ))}
      </div>
      {googleOn && <><button type="button" className="btn google" onClick={google}>Continue with Google</button>
      <div className="or"><span>or</span></div></>}
      <form onSubmit={submit} noValidate>
        <label>Email<input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} maxLength={254} /></label>
        <label>Password<input type="password" autoComplete={mode === 'in' ? 'current-password' : 'new-password'} required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} maxLength={128} /></label>
        <AnimatePresence>{msg && <motion.p key={msg.text} role={msg.kind === 'err' ? 'alert' : 'status'} className={`msg ${msg.kind}`} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>{msg.text}</motion.p>}</AnimatePresence>
        <button className="btn primary big full" disabled={loading}>{loading ? 'One moment...' : mode === 'in' ? 'Sign in' : 'Create account'}</button>
      </form>
    </>
  );
}
