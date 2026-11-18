import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const PRIVATE_PREFIXES = ['/studio', '/login', '/auth']; // never load ad/third-party scripts here

function buildCsp(nonce: string, path: string) {
  const dev = process.env.NODE_ENV === 'development';
  const supa = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin : '';
  const adsOn = Boolean(process.env.NEXT_PUBLIC_ADSENSE_CLIENT) && !PRIVATE_PREFIXES.some((p) => path.startsWith(p));

  const d: Record<string, string[]> = {
    'default-src': ["'self'"],
    'script-src': ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'", ...(dev ? ["'unsafe-eval'"] : [])],
    'style-src': ["'self'", "'unsafe-inline'"], // inline style attributes (React/Framer); scripts stay strict
    'img-src': ["'self'", 'blob:', 'data:', ...(adsOn ? ['https:'] : [])],
    'media-src': ["'self'", 'blob:'],
    'font-src': ["'self'"],
    'connect-src': ["'self'", ...(supa ? [supa] : []), ...(dev ? ['ws:'] : []),
      ...(adsOn ? ['https://pagead2.googlesyndication.com', 'https://*.google.com', 'https://*.doubleclick.net'] : [])],
    'frame-src': adsOn ? ['https://googleads.g.doubleclick.net', 'https://tpc.googlesyndication.com', 'https://*.google.com'] : ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
  };
  return Object.entries(d).map(([k, v]) => `${k} ${v.join(' ')}`).join('; ') + (dev ? '' : '; upgrade-insecure-requests');
}

export async function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const csp = buildCsp(nonce, request.nextUrl.pathname);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);

  let response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', csp);

  // Refresh the Supabase session and verify the user server-side (getUser, not getSession).
  let user = null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && key) {
    try {
      const supabase = createServerClient(url, key, {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll(list) {
            list.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({ request: { headers: requestHeaders } });
            response.headers.set('Content-Security-Policy', csp);
            list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          },
        },
      });
      user = (await supabase.auth.getUser()).data.user;
    } catch { user = null; }
  }

  const path = request.nextUrl.pathname;
  if (path.startsWith('/studio') && !user) {
    const to = request.nextUrl.clone();
    to.pathname = '/login'; to.search = '?next=/studio';
    const redirect = NextResponse.redirect(to);
    redirect.headers.set('Content-Security-Policy', csp);
    return redirect;
  }
  if (path === '/login' && user) {
    const to = request.nextUrl.clone();
    to.pathname = '/studio'; to.search = '';
    return NextResponse.redirect(to);
  }
  return response;
}

export const config = {
  matcher: [{ source: '/((?!_next/static|_next/image|favicon.ico|icon.svg).*)', missing: [{ type: 'header', key: 'next-router-prefetch' }, { type: 'header', key: 'purpose', value: 'prefetch' }] }],
};
