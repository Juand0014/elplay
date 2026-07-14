const CHANNEL_NAME = 'elplay-scorer-sync';

type ScorerSyncListener = () => void;

const listeners = new Set<ScorerSyncListener>();

let channel: BroadcastChannel | null = null;

function getChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === 'undefined') return null;
  if (!channel) {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = () => {
      listeners.forEach((listener) => listener());
    };
  }
  return channel;
}

/** Notify other tabs/windows that local scorer games changed. */
export function notifyScorerGamesChanged(): void {
  const bc = getChannel();
  bc?.postMessage({ type: 'games-updated', at: Date.now() });
  listeners.forEach((listener) => listener());
}

/** Subscribe to same-origin scorer updates (BroadcastChannel + optional storage). */
export function subscribeScorerSync(listener: ScorerSyncListener): () => void {
  listeners.add(listener);
  getChannel();

  const onStorage = (event: StorageEvent) => {
    if (event.key === 'elplay-scorer') {
      listener();
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', onStorage);
  }

  return () => {
    listeners.delete(listener);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', onStorage);
    }
  };
}
