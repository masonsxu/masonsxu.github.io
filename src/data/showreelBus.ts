import type { ShowreelId } from "./showreel-content";

/**
 * Tiny latched event bus for "play this clip" requests.
 * Lightweight (no Remotion import) so terminal/palette can request playback
 * without pulling the heavy video bundle into the main chunk.
 *
 * Latch: if a request arrives before the Showreel section has subscribed
 * (lazy chunk still loading), it is held in `pending` and replayed on subscribe.
 */
type PlayCallback = (id: ShowreelId) => void;

let subscriber: PlayCallback | null = null;
let pending: ShowreelId | null = null;

export function requestPlay(id: ShowreelId): void {
  if (subscriber) subscriber(id);
  else pending = id;
}

export function subscribePlay(cb: PlayCallback): () => void {
  subscriber = cb;
  if (pending !== null) {
    const replay = pending;
    pending = null;
    cb(replay);
  }
  return () => {
    if (subscriber === cb) subscriber = null;
  };
}
