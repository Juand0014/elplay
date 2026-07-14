import * as Linking from 'expo-linking';

import { getSupabase, hasSupabaseConfig } from '@/lib';

export type EmailSignInResult =
  | { ok: true }
  | {
      ok: false;
      reason: 'not_configured' | 'invalid_email' | 'send_failed';
      message: string;
    };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Optional email magic-link path (plan Part 3).
 * Guest + Google remain primary; email is available when Supabase Auth email is enabled.
 */
export async function signInWithEmailMagicLink(
  email: string,
): Promise<EmailSignInResult> {
  const trimmed = email.trim().toLowerCase();
  if (!EMAIL_RE.test(trimmed)) {
    return {
      ok: false,
      reason: 'invalid_email',
      message: 'Invalid email',
    };
  }

  if (!hasSupabaseConfig()) {
    return {
      ok: false,
      reason: 'not_configured',
      message: 'Supabase env is missing.',
    };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return {
      ok: false,
      reason: 'not_configured',
      message: 'Supabase client unavailable.',
    };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: trimmed,
    options: {
      emailRedirectTo: Linking.createURL('/'),
    },
  });

  if (error) {
    return {
      ok: false,
      reason: 'send_failed',
      message: error.message,
    };
  }

  return { ok: true };
}
