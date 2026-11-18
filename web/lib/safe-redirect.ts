/** Only allow same-site relative paths, to prevent open-redirect attacks after login. */
export function safeNext(value: string | null | undefined, fallback = '/studio'): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return fallback;
  return value;
}
