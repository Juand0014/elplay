import { useEffect } from 'react';

import { getSupabase } from '@/lib';
import { useSessionStore } from '@/stores/session.store';

function readDisplayName(
  metadata: Record<string, unknown>,
  email: string | undefined,
): string | null {
  const fullName = metadata.full_name;
  const name = metadata.name;
  if (typeof fullName === 'string' && fullName.length > 0) return fullName;
  if (typeof name === 'string' && name.length > 0) return name;
  return email ?? null;
}

/** Keeps Zustand session aligned with Supabase auth (Google) when configured. */
export function useAuthBootstrap() {
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    const applyUser = (user: {
      id: string;
      email?: string | null;
      user_metadata?: unknown;
    }) => {
      const metadata =
        user.user_metadata && typeof user.user_metadata === 'object'
          ? (user.user_metadata as Record<string, unknown>)
          : {};
      useSessionStore.getState().setAuthenticated({
        userId: user.id,
        displayName: readDisplayName(metadata, user.email ?? undefined),
      });
    };

    void supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        applyUser(data.session.user);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) {
        const current = useSessionStore.getState().mode;
        if (current === 'authenticated') {
          useSessionStore.getState().clearSession();
        }
        return;
      }
      applyUser(session.user);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);
}
