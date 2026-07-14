import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { getSupabase, hasSupabaseConfig } from '@/lib';

WebBrowser.maybeCompleteAuthSession();

export type GoogleSignInResult =
  | { ok: true }
  | {
      ok: false;
      reason: 'not_configured' | 'oauth_failed' | 'cancelled';
      message: string;
    };

/**
 * Starts Supabase Google OAuth.
 * Requires Google provider enabled in the Supabase dashboard + valid redirect URLs.
 */
export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  if (!hasSupabaseConfig()) {
    return {
      ok: false,
      reason: 'not_configured',
      message: 'Supabase env is missing (EXPO_PUBLIC_SUPABASE_URL / ANON_KEY).',
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

  const redirectTo = Linking.createURL('/');

  // Web: let the browser complete the redirect (Supabase returns to redirectTo).
  if (Platform.OS === 'web') {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: false,
      },
    });

    if (error) {
      return {
        ok: false,
        reason: 'oauth_failed',
        message: error.message,
      };
    }

    // Browser navigates away on success; treat as in-progress OK for callers.
    return { ok: true };
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error || !data.url) {
    return {
      ok: false,
      reason: 'oauth_failed',
      message: error?.message ?? 'Could not start Google sign-in.',
    };
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type !== 'success' || !('url' in result) || !result.url) {
    return {
      ok: false,
      reason: 'cancelled',
      message: 'Google sign-in was cancelled.',
    };
  }

  const parsed = new URL(result.url);
  const hashParams = new URLSearchParams(parsed.hash.replace(/^#/, ''));
  const accessToken =
    parsed.searchParams.get('access_token') ?? hashParams.get('access_token');
  const refreshToken =
    parsed.searchParams.get('refresh_token') ?? hashParams.get('refresh_token');

  if (!accessToken || !refreshToken) {
    return {
      ok: false,
      reason: 'oauth_failed',
      message: 'Missing tokens in OAuth redirect.',
    };
  }

  const { error: sessionError } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (sessionError) {
    return {
      ok: false,
      reason: 'oauth_failed',
      message: sessionError.message,
    };
  }

  return { ok: true };
}
