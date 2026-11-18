'use client';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
export default function SignOut() {
  const router = useRouter();
  return <button className="btn small" onClick={async () => { await createClient().auth.signOut(); router.replace('/'); router.refresh(); }}>Sign out</button>;
}
